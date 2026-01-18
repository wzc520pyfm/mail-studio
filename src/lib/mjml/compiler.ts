/**
 * Compiler - Re-export from features/editor for backward compatibility
 * @deprecated Import from '@/features/editor' instead
 */

export {
  nodeToMjml,
  generateMjml,
  compileMjml,
  compileDocument,
  parseMjmlToNode,
} from "@/features/editor/lib/mjml/compiler";
