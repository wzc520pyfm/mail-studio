/**
 * MJML library exports
 */

// Schema
export {
  componentDefinitions,
  componentCategories,
  createNode,
  generateId,
  getAllowedChildren,
  canContain,
  getComponentDefinition,
  predefinedSocialPlatforms,
  defaultSocialElements,
} from "./schema";

// Compiler
export {
  nodeToMjml,
  generateMjml,
  compileMjml,
  compileDocument,
  parseMjmlToNode,
} from "./compiler";

// Templates
export { templates, emptyDocument, cloneDocumentWithNewIds } from "./templates";
