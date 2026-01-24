## 2024-05-24 - ShareableArray Defragmentation Bug
**Learning:** `ShareableArray.defragment` was adding `DATA_OBJECT_OFFSET` twice to the `currentDataStart` pointer, causing gaps in the defragmented array and wasting 8 bytes per item.
**Action:** When implementing or modifying manual memory management logic, always double-check offset calculations and verify compaction with a test case that inspects used memory.

## 2024-05-24 - TypedArray.set vs Manual Loop
**Learning:** Replacing manual byte-by-byte copy loops with `Uint8Array.prototype.set` (using `subarray`) yielded a ~10x speedup for copying memory blocks.
**Action:** Always prefer `TypedArray.prototype.set` over manual loops for moving data.
