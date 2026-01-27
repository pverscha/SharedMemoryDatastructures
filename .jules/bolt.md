## 2024-05-23 - [TypedArray View Overhead]
**Learning:** In V8 (Node 20+), creating `Uint8Array.subarray` views inside a hot loop (100k+ iterations) for small blocks (<50 bytes) incurs significant overhead, making manual byte copying loops faster.
**Action:** Use hybrid approach: manual copy for small blocks, `subarray` + `set` for large blocks.
