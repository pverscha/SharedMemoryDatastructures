## 2026-01-19 - Avoid Intermediate Buffers with TextEncoder
**Learning:** TextEncoder.encodeInto works directly with Uint8Array views on SharedArrayBuffer. Intermediate buffers and copying are unnecessary and can double the execution time.
**Action:** Check TextEncoder usage for direct writing to destination buffers.
