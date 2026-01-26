import Serializable from "./Serializable";

export default class StringEncoder implements Serializable<string> {
    private textEncoder = new TextEncoder();
    private textDecoder = new TextDecoder();

    decode(buffer: Uint8Array): string {
        return this.textDecoder.decode(buffer);
    }

    encode(stringValue: string, destination: Uint8Array): number {
        // Safari does not support the encodeInto function
        if (this.textEncoder.encodeInto !== undefined) {
            const writeResult = this.textEncoder.encodeInto(stringValue, destination);
            return writeResult.written || 0;
        } else {
            const encodedString = this.textEncoder.encode(stringValue);
            destination.set(encodedString);
            return encodedString.byteLength;
        }
    }

    /**
     * An UTF-8 string that's encoded using the built-in TextEncoder will never occupy more than 3 * stringlength bytes.
     *
     * @param value The string value that should be encoded as a string with this StringEncoder.
     */
    maximumLength(value: string): number {
        return value.length * 3;
    }
}
