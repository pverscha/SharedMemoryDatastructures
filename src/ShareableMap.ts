import fnv from "fnv-plus";

export default class ShareableMap<K, V> extends Map<K, V> {
    // The default load factor to which this map should adhere
    private static readonly LOAD_FACTOR = 0.75;
    // How many bytes does one int use? (32 bits at this point)
    private static readonly INT_SIZE = 4;
    // We never use 0 as a valid index value, and thus this number is used to identify free space / unused blocks.
    private static readonly INVALID_VALUE = 0;
    // How many bytes for a data object are reserved for metadata? (e.g. pointer to next block, key length,
    // value length).
    private static readonly DATA_OBJECT_OFFSET = 12;
    private static readonly INDEX_TABLE_OFFSET = 12;

    private index!: SharedArrayBuffer;
    private data!: SharedArrayBuffer;

    private indexView!: DataView;
    private dataView!: DataView;

    /**
     * Construct a new ShareableMap.
     *
     * @param expectedSize How many items are expected to be stored in this map? Setting this to a good estimate from
     * the beginning is important not to trash performance.
     */
    constructor(expectedSize: number = 1024) {
        super();
        this.reset(expectedSize);
    }

    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.entries();
    }

    *entries(): IterableIterator<[K, V]> {
        for (let i = 0; i < this.buckets; i++) {
            let dataPointer = this.indexView.getUint32(ShareableMap.INDEX_TABLE_OFFSET + i * 4);
            while (dataPointer !== 0) {
                const key = this.readKeyFromDataObject(dataPointer) as unknown as K;
                const value = this.readValueFromDataObject(dataPointer) as unknown as V;
                yield [key, value];
                dataPointer = this.dataView.getUint32(dataPointer);
            }
        }
    }

    *keys(): IterableIterator<K> {
        for (let i = 0; i < this.buckets; i++) {
            let dataPointer = this.indexView.getUint32(ShareableMap.INDEX_TABLE_OFFSET + i * 4);
            while (dataPointer !== 0) {
                // TODO fix types here
                yield this.readKeyFromDataObject(dataPointer) as unknown as K;
                dataPointer = this.dataView.getUint32(dataPointer);
            }
        }
    }

    *values(): IterableIterator<V> {
        for (let i = 0; i < this.buckets; i++) {
            let dataPointer = this.indexView.getUint32(ShareableMap.INDEX_TABLE_OFFSET + i * 4);
            while (dataPointer !== 0) {
                // TODO fix types here
                yield this.readValueFromDataObject(dataPointer) as unknown as V;
                dataPointer = this.dataView.getUint32(dataPointer);
            }
        }
    }

    clear(expectedSize: number = 1024): void {
        this.reset(expectedSize);
    }

    delete(key: K): boolean {
        throw "UnsupportedOperationException";
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
        const bucket = (hash % this.buckets) * 4;

        const stringVal = this.findValue(
            this.indexView.getUint32(bucket + ShareableMap.INDEX_TABLE_OFFSET),
            stringKey
        );

        // TODO fix for all types here!
        return stringVal as unknown as V;
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
        this.storeDataBlock(stringKey, value);
        // Increase size
        this.increaseSize();

        const bucketPointer = this.indexView.getUint32(bucket + ShareableMap.INDEX_TABLE_OFFSET);
        if (bucketPointer === 0) {
            this.indexView.setUint32(bucket + ShareableMap.INDEX_TABLE_OFFSET, nextFree);
        } else {
            // Update linked list pointers
            this.updateLinkedPointer(bucketPointer, nextFree);
        }

        return this;
    }

    get size() {
        // Size is being stored in the first 4 bytes of the index table
        return this.indexView.getUint32(0);
    }

    private get buckets() {
        // Number of buckets is stored in the second integer of the index table
        return this.indexView.getUint32(4);
    }

    private get freeStart() {
        // At what position in the data table does the free space start?
        return this.indexView.getUint32(8);
    }

    private set freeStart(position) {
        this.indexView.setUint32(8, position);
    }

    /***********************************************
     * Helper methods that read / write binary data
     * to the array buffers.
     ***********************************************/

    private increaseSize() {
        this.indexView.setUint32(0, this.size + 1);
    }

    private storeDataBlock(key: string, value: any) {
        const nextFree = this.freeStart;

        const textEncoder = new TextEncoder();

        // Store key in data structure
        const keyArray: Uint8Array = new Uint8Array(this.data, nextFree + ShareableMap.DATA_OBJECT_OFFSET);
        let writeResult = textEncoder.encodeInto(key, keyArray);
        const keyLength = writeResult.written ? writeResult.written : 0;

        let stringVal: string;
        if (typeof value !== "string") {
            stringVal = JSON.stringify(value);
        } else {
            stringVal = value;
        }

        const valueArray: Uint8Array = new Uint8Array(
            this.data,
            nextFree + ShareableMap.DATA_OBJECT_OFFSET + keyLength
        );
        writeResult = textEncoder.encodeInto(stringVal, valueArray);
        const valueLength = writeResult.written ? writeResult.written : 0;


        // Store key length
        this.dataView.setUint32(nextFree + 4, keyLength);
        // Store value length
        this.dataView.setUint32(nextFree + 8, valueLength);

        this.freeStart = nextFree + ShareableMap.DATA_OBJECT_OFFSET + keyLength + valueLength;
    }

    private updateLinkedPointer(startPos: number, nextBlock: number) {
        while (this.dataView.getUint32(startPos) !== 0) {
            startPos = this.dataView.getUint32(startPos);
        }
        this.dataView.setUint32(startPos, nextBlock);
    }

    private findValue(startPos: number, key: string): string | undefined {
        while (startPos !== 0) {
            const readKey = this.readKeyFromDataObject(startPos);
            if (readKey === key) {
                return this.readValueFromDataObject(startPos);
            } else {
                startPos = this.dataView.getUint32(startPos);
            }
        }
        return undefined;
    }

    private readKeyFromDataObject(startPos: number): string {
        const keyLength = this.dataView.getUint32(startPos + 4);

        const textDecoder = new TextDecoder();

        const keyArray: Uint8Array = new Uint8Array(
            this.data,
            startPos + ShareableMap.DATA_OBJECT_OFFSET,
            keyLength
        );
        return textDecoder.decode(keyArray);
    }

    private readValueFromDataObject(startPos: number): string {
        const keyLength = this.dataView.getUint32(startPos + 4);
        const valueLength = this.dataView.getUint32(startPos + 8);

        const textDecoder = new TextDecoder();
        const valueArray: Uint8Array = new Uint8Array(
            this.data,
            startPos + ShareableMap.DATA_OBJECT_OFFSET + keyLength,
            valueLength
        );
        return textDecoder.decode(valueArray);
    }

    private reset(expectedSize: number) {
        // First 4 bytes are used to store the amount of items in the map. Second 4 bytes keep track of how many buckets
        // are currently being used. Third set of 4 bytes is used to track where the free space in the data table
        // starts. Rest of the index maps buckets onto their starting position in the data array.
        const buckets = Math.ceil(expectedSize / ShareableMap.LOAD_FACTOR)
        const indexSize = 3 * 4 + buckets * ShareableMap.INT_SIZE;
        this.index = new SharedArrayBuffer(indexSize);
        this.indexView = new DataView(this.index, 0, indexSize);

        // Set buckets
        this.indexView.setUint32(4, buckets);
        // Free space starts from position 1 in the data array (instead of 0, which we use to indicate the end).
        this.indexView.setUint32(8, 4);

        // Reserve 256 bytes per value (since strings are going to be stored in this map).
        this.data = new SharedArrayBuffer(256 * expectedSize);
        this.dataView = new DataView(this.data, 0, 256 * expectedSize);
    }
}
