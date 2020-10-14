export default interface Serializable<T> {
    encode(object: T): ArrayBuffer;
    decode(buffer: ArrayBuffer): T;
}
