// Plain JavaScript entry point for worker threads.
// Uses tsx's tsImport() to load the TypeScript worker logic with full
// TypeScript module resolution (including extensionless imports like
// `./../encoding/Serializable` → `./../encoding/Serializable.ts`).
// This bypasses the limitation of --import tsx/esm, which does not
// transitively resolve extensionless TypeScript imports in Node.js v24.
import { tsImport } from 'tsx/esm/api';

await tsImport('./concurrent-worker.ts', import.meta.url);
