## 2026-01-19 - Avoid Intermediate Buffers with TextEncoder
**Learning:** TextEncoder.encodeInto works directly with Uint8Array views on SharedArrayBuffer. Intermediate buffers and copying are unnecessary and can double the execution time.
**Action:** Check TextEncoder usage for direct writing to destination buffers.
## 2026-01-20 - Optimize Read Performance with Zero-Copy
**Learning:** TextDecoder can sometimes decode directly from SharedArrayBuffer views, but browser support varies. Feature detection is required. NumberEncoder (DataView) always supports SAB but requires respecting byteOffset.
**Action:** Use feature detection for TextDecoder and fix DataView offsets to enable zero-copy reads.
