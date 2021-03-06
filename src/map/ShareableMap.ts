import fnv from "fnv-plus";
import Serializable from "./../encoding/Serializable";

/**
 * Special implementation of the Map API that internally uses ArrayBuffers for it's data storage. These buffers can be
 * easily transferred between threads with a zero-copy cost, which allows to gain a much higher communication speed
 * between threads. You need to call `getBuffers()` and `setBuffers()` and manually transfer the buffers for this map
 * between threads to use this benefits.
 *
 * NOTE: When no support for SharedArrayBuffers is available, this map will automatically fall back to regular
 * ArrayBuffers, which can also be transferred between threads (but cannot be used by multiple threads at the same
 * time).
 *
 * Note: This Map currently does not support deleting items or changing the values that belong to a key since this
 * would require extensive memory alignment and management.
 *
 * @author Pieter Verschaffelt
 */
export default class ShareableMap<K, V> extends Map<K, V> {
    // The default load factor to which this map should adhere
    private static readonly LOAD_FACTOR = 0.75;
    // How many bytes does one int use? (32 bits at this point)
    private static readonly INT_SIZE = 4;
    // We never use 0 as a valid index value, and thus this number is used to identify free space / unused blocks.
    private static readonly INVALID_VALUE = 0;
    // How many bytes for a data object are reserved for metadata? (e.g. pointer to next block, key length,
    // value length).
    private static readonly DATA_OBJECT_OFFSET = 20;
    private static readonly INDEX_TABLE_OFFSET = 16;

    private index!: ArrayBuffer;
    private data!: ArrayBuffer;

    private indexView!: DataView;
    private dataView!: DataView;

    private textEncoder: TextEncoder = new TextEncoder();
    private textDecoder: TextDecoder = new TextDecoder();

    /**
     * Construct a new ShareableMap.
     *
     * @param expectedSize How many items are expected to be stored in this map? Setting this to a good estimate from
     * the beginning is important not to trash performance.
     * @param averageBytesPerValue What's the expected average size of one serialized value that will be stored in this
     * map?
     * @param serializer Custom serializer to convert the objects stored in this map as a value to an ArrayBuffer and
     * vice-versa.
     */
    constructor(
        expectedSize: number = 1024,
        averageBytesPerValue: number = 256,
        private readonly serializer?: Serializable<V>
    ) {
        super();
        this.reset(expectedSize, averageBytesPerValue);
    }

    /**
     * Get the internal buffers that represent this map and that can be transferred without cost between threads. Use
     * setBuffers() to rebuild a ShareableMap after the buffers have been transferred.
     */
    public getBuffers(): ArrayBuffer[] {
        return [this.index, this.data];
    }

    /**
     * Set the internal buffers that represent this map and that can be transferred without cost between threads.
     *
     * @param indexBuffer Index table buffer that's used to keep track of which values are stored where in the
     * dataBuffer.
     * @param dataBuffer Portion of memory in which all the data itself is stored.
     */
    public setBuffers(indexBuffer: ArrayBuffer, dataBuffer: ArrayBuffer) {
        this.index = indexBuffer;
        this.indexView = new DataView(this.index);
        this.data = dataBuffer;
        this.dataView = new DataView(this.data);
    }

    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.entries();
    }

    *entries(): IterableIterator<[K, V]> {
        for (let i = 0; i < this.buckets; i++) {
            let dataPointer = this.indexView.getUint32(ShareableMap.INDEX_TABLE_OFFSET + i * ShareableMap.INT_SIZE);
            while (dataPointer !== 0) {
                const key = this.readTypedKeyFromDataObject(dataPointer);
                const value = this.readValueFromDataObject(dataPointer);
                yield [key, value];
                dataPointer = this.dataView.getUint32(dataPointer);
            }
        }
    }

    *keys(): IterableIterator<K> {
        for (let i = 0; i < this.buckets; i++) {
            let dataPointer = this.indexView.getUint32(ShareableMap.INDEX_TABLE_OFFSET + i * ShareableMap.INT_SIZE);
            while (dataPointer !== 0) {
                yield this.readTypedKeyFromDataObject(dataPointer);
                dataPointer = this.dataView.getUint32(dataPointer);
            }
        }
    }

    *values(): IterableIterator<V> {
        for (let i = 0; i < this.buckets; i++) {
            let dataPointer = this.indexView.getUint32(ShareableMap.INDEX_TABLE_OFFSET + i * 4);
            while (dataPointer !== 0) {
                yield this.readValueFromDataObject(dataPointer);
                dataPointer = this.dataView.getUint32(dataPointer);
            }
        }
    }

    clear(expectedSize: number = 1024, averageBytesPerValue: number = 256): void {
        this.reset(expectedSize, averageBytesPerValue);
    }

    delete(key: K): boolean {
        throw new Error("Deleting a key from a ShareableMap is not supported at this moment.")
    }

    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
        super.forEach(callbackfn, thisArg);
    }

    get(key: K): V | undefined {
        let stringKey: string;
        if (typeof key !== "string") {
            stringKey = JSON.stringify(key);
        } else {
            stringKey = key;
        }

        const hash: number = fnv.fast1a32(stringKey);
        // Bucket in which this value should be stored.
        const bucket = (hash % this.buckets) * ShareableMap.INT_SIZE;

        const returnValue = this.findValue(
            this.indexView.getUint32(bucket + ShareableMap.INDEX_TABLE_OFFSET),
            stringKey,
            hash
        );

        if (returnValue) {
            return returnValue[1];
        }
        return undefined;
    }

    has(key: K): boolean {
        return this.get(key) !== undefined;
    }

    set(key: K, value: V): this {
        let stringKey: string;
        if (typeof key !== "string") {
            stringKey = JSON.stringify(key);
        } else {
            stringKey = key;
        }

        const hash: number = fnv.fast1a32(stringKey);
        // Bucket in which this value should be stored.
        const bucket = (hash % this.buckets) * 4;

        const nextFree = this.freeStart;

        // Pointer to next block is empty at this point
        this.storeDataBlock(key, value, hash);
        // Increase size
        this.increaseSize();

        const bucketPointer = this.indexView.getUint32(bucket + ShareableMap.INDEX_TABLE_OFFSET);
        if (bucketPointer === 0) {
            this.incrementBucketsInUse();
            this.indexView.setUint32(bucket + ShareableMap.INDEX_TABLE_OFFSET, nextFree);
        } else {
            // Update linked list pointers
            this.updateLinkedPointer(bucketPointer, nextFree);
        }

        // If the load factor exceeds the recommended value, we need to rehash the map to make sure performance stays
        // acceptable.
        if ((this.getBucketsInUse() / this.buckets) >= ShareableMap.LOAD_FACTOR) {
            this.doubleIndexStorage();
        }

        return this;
    }

    get size() {
        // Size is being stored in the first 4 bytes of the index table
        return this.indexView.getUint32(0);
    }

    /**
     * @return The amount of buckets that are currently available in this map (either taken or not-taken, the total
     * number of buckets is returned).
     */
    private get buckets() {
        return (this.indexView.byteLength - ShareableMap.INDEX_TABLE_OFFSET) / ShareableMap.INT_SIZE;
    }

    /**
     * @return The amount of buckets that currently point to a data object.
     */
    private getBucketsInUse() {
        return this.indexView.getUint32(4);
    }

    /**
     * Increase the amount of buckets that currently point to a data object by one.
     */
    private incrementBucketsInUse() {
        return this.indexView.setUint32(4, this.getBucketsInUse() + 1);
    }

    /**
     * At what position in the data-array does the next block of free space start? This position is returned as number
     * of bytes since the start of the array.
     */
    private get freeStart() {
        // At what position in the data table does the free space start?
        return this.indexView.getUint32(8);
    }

    /**
     * Update the position where the next block of free space in the data array starts.
     *
     * @param position The new position that should be set. Must indicate the amount of bytes from the start of the
     * data array.
     */
    private set freeStart(position) {
        this.indexView.setUint32(8, position);
    }

    /**
     * @return Total current length of the data array in bytes.
     */
    private get dataSize() {
        return this.indexView.getUint32(12);
    }

    /**
     * Update the total length of the data array.
     *
     * @param size New length value, in bytes.
     */
    private set dataSize(size) {
        this.indexView.setUint32(12, size);
    }

    /**
     * Increase the size counter by one. This counter keeps track of how many items are currently stored in this map.
     */
    private increaseSize() {
        this.indexView.setUint32(0, this.size + 1);
    }

    /**
     * Allocate a new ArrayBuffer that's twice the size of the previous buffer and copy all contents from the old to the
     * new buffer. This method should be called when not enough free space is available for elements to be stored.
     */
    private doubleDataStorage() {
        let newData: ArrayBuffer;

        try {
            newData = new SharedArrayBuffer(this.dataSize * 2);
        } catch (error) {
            newData = new ArrayBuffer(this.dataSize * 2);
        }

        const newView = new DataView(newData, 0, this.dataSize * 2);

        for (let i = 0; i < this.dataSize; i += 4) {
            newView.setUint32(i, this.dataView.getUint32(i));
        }

        this.data = newData;
        this.dataView = newView;

        this.dataSize *= 2;
    }

    /**
     * Call this function if the effective load factor of the map is higher than the allowed load factor (default 0.75).
     * This method will double the amount of available buckets and make sure all pointers are placed in the correct
     * location.
     */
    private doubleIndexStorage() {
        let newIndex: ArrayBuffer;

        try {
            newIndex = new SharedArrayBuffer(ShareableMap.INDEX_TABLE_OFFSET + ShareableMap.INT_SIZE * (this.buckets * 2));
        } catch (error) {
            newIndex = new ArrayBuffer(ShareableMap.INDEX_TABLE_OFFSET + ShareableMap.INT_SIZE * (this.buckets * 2));
        }
        const newView = new DataView(newIndex, 0, ShareableMap.INDEX_TABLE_OFFSET + ShareableMap.INT_SIZE * (this.buckets * 2));
        let bucketsInUse: number = 0;

        // Now, we need to rehash all previous values and recompute the bucket pointers
        for (let bucket = 0; bucket < this.buckets; bucket++) {
            let startPos = this.indexView.getUint32(ShareableMap.INDEX_TABLE_OFFSET + bucket * 4);

            while (startPos !== 0) {
                // Read key and rehash
                const key = this.readKeyFromDataObject(startPos);

                const hash: number = fnv.fast1a32(key);
                const newBucket = hash % (this.buckets * 2);

                const currentBucketContent = newView.getUint32(ShareableMap.INDEX_TABLE_OFFSET + newBucket * 4);
                // Should we directly update the bucket content or follow the links and update those?
                if (currentBucketContent === 0) {
                    bucketsInUse++;
                    newView.setUint32(ShareableMap.INDEX_TABLE_OFFSET + newBucket * 4, startPos);
                } else {
                    this.updateLinkedPointer(currentBucketContent, startPos);
                }

                // Follow link in the chain and update it's properties.
                const newStartPos = this.dataView.getUint32(startPos);
                this.dataView.setUint32(startPos, 0);
                startPos = newStartPos;
            }
        }

        // Set metadata
        newView.setUint32(0, this.indexView.getUint32(0));
        newView.setUint32(4, bucketsInUse);
        newView.setUint32(8, this.indexView.getUint32(8));
        newView.setUint32(12, this.indexView.getUint32(12));

        this.index = newIndex;
        this.indexView = newView;
    }

    private objectToString(obj: any): string {
        let stringVal: string;
        if (typeof obj !== "string") {
            stringVal = JSON.stringify(obj);
        } else {
            stringVal = obj;
        }

        return stringVal;
    }

    /**
     * Encode a string value and store into the given view. This function returns the amount of bytes that are used
     * for the encoded string.
     *
     * @param stringValue String value that should be encoded into the array.
     * @param view View of the array in which the encoded result is stored.
     * @return The number of bytes that are used for the encoded string result.
     */
    private encodeString(stringValue: string, view: Uint8Array): number {
        // Safari does not support the encodeInto function
        if (this.textEncoder.encodeInto !== undefined) {
            try {
                const writeResult = this.textEncoder.encodeInto(stringValue, view);
                return writeResult.written ? writeResult.written : 0;
            } catch (error) {
                // Try again with a separate, non-shared arraybuffer (some browsers do not accept SharedArrayBuffers
                // for the encodeInto function yet).
                const buffer = new Uint8Array(new ArrayBuffer(stringValue.length * 2));
                const writeResult = this.textEncoder.encodeInto(stringValue, buffer);
                const writeLength = writeResult.written ? writeResult.written : 0;
                for (let i = 0; i < writeLength; i++) {
                    view[i] = buffer[i];
                }
                return writeLength;
            }
        } else {
            const encodedString = this.textEncoder.encode(stringValue);
            for (let i = 0; i < encodedString.byteLength; i++) {
                view[i] = encodedString[i];
            }
            return encodedString.byteLength;
        }
    }

    private encodeValue(value: V, view: Uint8Array): number {
        if (this.serializer) {
            return this.serializer.encode(value, new DataView(view));
        } else {
            const stringVal = this.objectToString(value);
            return this.encodeString(stringVal, view);
        }
    }

    private getEncodedValueLength(value: V): number {
        if (this.serializer) {
            return this.serializer.maximumLength(value);
        } else {
            const objValue = this.objectToString(value);
            return objValue.length * 2;
        }
    }

    /**
     * Allocates some space in the data array to store a new data object. Such a data object keeps track of it's
     * internal length, points to the next item in the current linked list of objects and keeps track of it's key and
     * value.
     *
     * @param key The key that identifies the given value.
     * @param value The value that's associated with the given key.
     * @param hash The hash computed from the given key.
     */
    private storeDataBlock(key: K, value: V, hash: number) {
        const nextFree = this.freeStart;

        const keyString = this.objectToString(key);
        const maxKeyLength = keyString.length * 2;

        const maxValueLength = this.getEncodedValueLength(value);

        // Determine if the data storage needs to be resized.
        if (maxKeyLength + maxValueLength + nextFree + ShareableMap.DATA_OBJECT_OFFSET > this.dataSize) {
            this.doubleDataStorage();
        }

        const exactKeyLength = this.encodeString(
            keyString,
            new Uint8Array(
                this.data,
                ShareableMap.DATA_OBJECT_OFFSET + nextFree,
                maxKeyLength
            )
        );

        const exactValueLength = this.encodeValue(
            value,
            new Uint8Array(
                this.data,
                ShareableMap.DATA_OBJECT_OFFSET + nextFree + exactKeyLength,
                maxValueLength
            )
        );


        // Store key length
        this.dataView.setUint32(nextFree + 4, exactKeyLength);
        // Store value length
        this.dataView.setUint32(nextFree + 8, exactValueLength);
        // Keep track of key and value datatypes
        this.dataView.setUint16(nextFree + 12, typeof key === "string" ? 1 : 0);
        this.dataView.setUint16(nextFree + 14, typeof value === "string" ? 1 : 0);
        this.dataView.setUint32(nextFree + 16, hash);

        this.freeStart = nextFree + ShareableMap.DATA_OBJECT_OFFSET + exactKeyLength + exactValueLength;
    }

    /**
     * Update a data object's pointer to the next object in a linked list.
     *
     * @param startPos The starting position of the data object whose "next"-pointer needs to be updated.
     * @param nextBlock Value of the "next"-pointer that either points to a valid starting position of a data object, or
     * a 0 if this is the last object in a linked chain of objects.
     */
    private updateLinkedPointer(startPos: number, nextBlock: number) {
        while (this.dataView.getUint32(startPos) !== 0) {
            startPos = this.dataView.getUint32(startPos);
        }
        this.dataView.setUint32(startPos, nextBlock);
    }

    /**
     * Start looking for a specific key in a given link of data objects and return the associated value. The starting
     * position given to this function should point to the first data object in the link that's to be examined. If the
     * key is not found at this position, the pointer to the next data object is followed until either the key is found,
     * or no link to the following object exists.
     *
     * @param startPos Position of the first data object in the linked list that should be examined.
     * @param key The key that we're currently looking for.
     * @param hash The hash that corresponds to the key that we are currently investigating.
     * @return The starting position of the data object and value associated with the given key. If no such key was
     * found, undefined is returned.
     */
    private findValue(
        startPos: number,
        key: string,
        hash: number
    ): [number, V] | undefined {
        while (startPos !== 0) {
            const readHash = this.readHashFromDataObject(startPos);
            if (readHash === hash) {
                return [startPos, this.readValueFromDataObject(startPos)];
            } else {
                startPos = this.dataView.getUint32(startPos);
            }
        }
        return undefined;
    }

    /**
     * Returns the hash associated with the data object starting at the given starting position.
     * @param startPos
     * @private
     */
    private readHashFromDataObject(startPos: number): number {
        return this.dataView.getUint32(startPos + 16);
    }

    /**
     * Returns the key associated with the data object starting at the given starting position.
     *
     * @param startPos The starting position of the data object from which the associated key should be extracted.
     */
    private readKeyFromDataObject(startPos: number): string {
        const keyLength = this.dataView.getUint32(startPos + 4);
        const dataView = new DataView(this.data, startPos + ShareableMap.DATA_OBJECT_OFFSET, keyLength)
        return this.textDecoder.decode(dataView);
    }

    private readTypedKeyFromDataObject(startPos: number): K {
        const stringKey = this.readKeyFromDataObject(startPos);

        if (this.dataView.getUint16(startPos + 12) === 1) {
            return stringKey as unknown as K;
        } else {
            return JSON.parse(stringKey) as unknown as K;
        }
    }

    /**
     * Returns the value associated with the data object starting at the given starting position.
     *
     * @param startPos The starting position of the data object from which the associated value should be returned.
     */
    private readValueFromDataObject(startPos: number): V {
        const keyLength = this.dataView.getUint32(startPos + 4);
        const valueLength = this.dataView.getUint32(startPos + 8);

        // Since some browsers do not support decoding from a SharedArrayBuffer, we had to disable this feature for now
        // const dataView = new DataView(
        //     this.data,
        //     startPos + ShareableMap.DATA_OBJECT_OFFSET + keyLength,
        //     valueLength
        // );

        const textView = new DataView(new ArrayBuffer(valueLength));

        for (let byte = 0; byte < valueLength; byte++) {
            textView.setUint8(
                byte,
                this.dataView.getUint32(startPos + ShareableMap.DATA_OBJECT_OFFSET + keyLength + byte)
            );
        }

        if (this.dataView.getUint16(startPos + 14) === 1) {
            // V should be a string in this case
            return this.textDecoder.decode(textView) as unknown as V;
        } else {
            // V is not a string and needs to be decoded into the expected result.
            if (this.serializer) {
                return this.serializer.decode(textView);
            } else {
                return JSON.parse(this.textDecoder.decode(textView)) as unknown as V;
            }
        }
    }

    /**
     * Clear all contents of this map and return to the initial configuration.
     *
     * @param expectedSize How many elements are expected to be stored in this map? Setting this value initially to a
     * good estimate could help with improving performance for this map.
     * @param averageBytesPerValue how large do we expect one value element to be on average. Setting this to a good
     * estimate can improve performance of this map.
     */
    private reset(expectedSize: number, averageBytesPerValue: number) {
        if (averageBytesPerValue % 4 !== 0) {
            throw new Error("Average bytes per value must be a multiple of 4.");
        }

        // First 4 bytes are used to store the amount of items in the map. Second 4 bytes keep track of how many buckets
        // are currently being used. Third set of 4 bytes is used to track where the free space in the data table
        // starts. Fourth set of 4 bytes keep tracks of the length of the DataBuffer. Rest of the index maps buckets
        // onto their starting position in the data array.
        const buckets = Math.ceil(expectedSize / ShareableMap.LOAD_FACTOR)
        const indexSize = 4 * 4 + buckets * ShareableMap.INT_SIZE;

        try {
            this.index = new SharedArrayBuffer(indexSize);
        } catch (error) {
            console.warn("Fallback to regular ArrayBuffer...");
            this.index = new ArrayBuffer(indexSize);
        }

        this.indexView = new DataView(this.index, 0, indexSize);

        // Set buckets
        this.indexView.setUint32(4, 0);
        // Free space starts from position 1 in the data array (instead of 0, which we use to indicate the end).
        this.indexView.setUint32(8, 4);

        // Size must be a multiple of 4
        const dataSize = averageBytesPerValue * expectedSize;

        try {
            this.data = new SharedArrayBuffer(dataSize);
        } catch (error) {
            console.warn("Fallback to regular ArrayBuffer...");
            this.data = new ArrayBuffer(dataSize);
        }

        this.dataView = new DataView(this.data, 0, dataSize);
        // Keep track of the size of the data part of the map.
        this.indexView.setUint32(12, dataSize);
    }
}
