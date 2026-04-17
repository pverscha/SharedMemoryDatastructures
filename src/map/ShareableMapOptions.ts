import Serializable from "../encoding/Serializable";

export default interface ShareableMapOptions<V> {
    /**
     * How many items are expected to be stored in this map? Setting this to a good estimate from the beginning can help
     * the map to allocate the correct amount of memory and improve performance.
     *
     * Note that this is not a hard limit, the map will still grow dynamically if more items are added.
     */
    expectedSize?: number,

    /**
     * What's the expected average size of one serialized value that will be stored in this map? Correctly setting this
     * value to a good estimate increases performance of the ShareableMap.
     *
     * Note that this is not a hard limit, the map will still grow dynamically if more items are added.
     */
    averageBytesPerValue?: number,

    /**
     * Custom serializer to convert the objects stored in this map as a value to an ArrayBuffer and vice-versa.
     * Providing your own implementation of a serializable for complex objects can drastically speed up real-world
     * performance of the ShareableMap.
     */
    serializer?: Serializable<V>;

    /**
     * Maximum number of bytes the data buffer may grow to. Virtual address space is reserved at construction time,
     * but physical pages are committed lazily by the OS, so a large value is inexpensive to declare.
     *
     * Defaults to 256 MiB. This is a hard ceiling — inserting data beyond this limit will throw a RangeError.
     */
    maxBytes?: number;
};
