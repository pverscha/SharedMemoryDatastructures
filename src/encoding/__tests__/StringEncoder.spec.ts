import StringEncoder from "../StringEncoder";

describe("StringEncoder", () => {
    it("should correctly encode a string into a Uint8Array view", () => {
        const encoder = new StringEncoder();
        const str = "Hello World! €";

        // Use SharedArrayBuffer if available, otherwise ArrayBuffer
        const bufferType = typeof SharedArrayBuffer !== 'undefined' ? SharedArrayBuffer : ArrayBuffer;
        const buffer = new bufferType(1024);
        const view = new Uint8Array(buffer);

        // Create a view at an offset
        const offset = 100;
        const dest = view.subarray(offset, offset + 100);

        const written = encoder.encode(str, dest);

        // Verify return value
        const expectedEncoded = new TextEncoder().encode(str);
        expect(written).toBe(expectedEncoded.length);

        // Verify content
        const result = dest.subarray(0, written);
        expect(result).toEqual(expectedEncoded);

        // Verify original buffer content at offset
        const fullView = new Uint8Array(buffer);
        const writtenSlice = fullView.subarray(offset, offset + written);
        expect(writtenSlice).toEqual(expectedEncoded);
    });
});
