export default class ShareableMap<K, V> extends Map<K, V> {
    private static readonly LOAD_FACTOR;
    private static readonly INT_SIZE;
    private static readonly INVALID_VALUE;
    private static readonly DATA_OBJECT_OFFSET;
    private static readonly INDEX_TABLE_OFFSET;
    private index;
    private data;
    private indexView;
    private dataView;
    /**
     * Construct a new ShareableMap.
     *
     * @param expectedSize How many items are expected to be stored in this map? Setting this to a good estimate from
     * the beginning is important not to trash performance.
     */
    constructor(expectedSize?: number);
    [Symbol.iterator](): IterableIterator<[K, V]>;
    entries(): IterableIterator<[K, V]>;
    keys(): IterableIterator<K>;
    values(): IterableIterator<V>;
    clear(expectedSize?: number): void;
    delete(key: K): boolean;
    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
    get(key: K): V | undefined;
    has(key: K): boolean;
    set(key: K, value: V): this;
    get size(): number;
    private get buckets();
    private get freeStart();
    private set freeStart(value);
    /***********************************************
     * Helper methods that read / write binary data
     * to the array buffers.
     ***********************************************/
    private increaseSize;
    private storeDataBlock;
    private updateLinkedPointer;
    private findValue;
    private readKeyFromDataObject;
    private readValueFromDataObject;
    private reset;
}
