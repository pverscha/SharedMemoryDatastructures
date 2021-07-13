import Serializable from "./Serializable";

export default class NumberEncoder implements Serializable<number> {
    decode(buffer: DataView): number {
        // First byte indicates if we did store a float or an int
        const numberType = buffer.getUint8(0);
        if (numberType === 0) {
            return buffer.getInt32(1);
        } else {
            return buffer.getFloat64(1);
        }
    }

    encode(value: number, destination: Uint8Array): number {
        const dataView = new DataView(destination.buffer, destination.byteOffset, destination.byteLength);
        if (Number.isInteger(value)) {
            dataView.setUint8(0, 0);
            dataView.setInt32(1, value);
            return 5;
        } else {
            dataView.setUint8(0, 1);
            dataView.setFloat64(1, value);
            return 9;
        }
    }

    maximumLength(value: number): number {
        return Number.isInteger(value) ? 5 : 9;
    }
}
