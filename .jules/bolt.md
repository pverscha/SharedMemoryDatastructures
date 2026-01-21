## 2025-05-20 - ShareableMap Defragmentation Optimization
**Learning:** `Uint8Array.prototype.set` combined with `subarray` is significantly faster (~3x) than byte-by-byte copying for `ShareableMap` defragmentation, but only when item sizes are large enough (e.g. > 1KB). for very small items (<50 bytes), the overhead of creating view objects cancels out the benefit.
**Action:** When optimizing block copies in JS, always verify with realistic data sizes. Use `dest.set(src.subarray(...))` pattern instead of creating new typed arrays inside loops.
