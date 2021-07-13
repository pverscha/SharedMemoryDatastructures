import Serializable from "./Serializable";

export default class IntEncoder implements Serializable<number> {
    decode(buffer: DataView): number {
        return buffer.getInt32(0);
    }

    encode(value: number, destination: Uint8Array): number {
        const dataView = new DataView(destination.buffer, destination.byteOffset, destination.byteLength);
        dataView.setInt32(0, value);
        return 4;
    }

    maximumLength(value: number): number {
        return 4;
    }
}
