import Serializable from "./Serializable";

export default class FloatEncoder implements Serializable<number> {
    decode(buffer: DataView): number {
        return buffer.getFloat64(0);
    }

    encode(value: number, destination: Uint8Array): number {
        const dataView = new DataView(destination.buffer, destination.byteOffset, destination.byteLength);
        dataView.setFloat64(0, value);
        return 8;
    }

    maximumLength(value: number): number {
        return 8;
    }
}
