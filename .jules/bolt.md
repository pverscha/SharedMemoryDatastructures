## 2025-05-22 - TypedArray loop vs set() with subarray
**Learning:** In V8 (Node 20+), creating `subarray` views inside a hot loop (100k+ iterations) for small blocks (20-30 bytes) adds significant overhead, making `Uint8Array.prototype.set(source.subarray(...))` slower than a simple `for` loop copying bytes between TypedArrays.
**Action:** When copying many small non-contiguous blocks, prefer a manual loop over TypedArrays rather than creating many temporary views. Use `set()` only for large contiguous blocks.
