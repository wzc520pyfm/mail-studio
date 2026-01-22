/**
 * Locked Regions Utilities
 * Pure functions for parsing and checking locked regions in MJML code
 */

import type { LockedRegion, IRange } from "../types";

/**
 * Parse MJML code and find all locked regions (lines with data-locked="true" tags)
 */
export function findLockedRegions(code: string): LockedRegion[] {
  const regions: LockedRegion[] = [];
  const lines = code.split("\n");

  // Stack to track nested locked elements
  const lockedStack: { tagName: string; startLine: number; startColumn: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1; // Monaco uses 1-based line numbers

    // Check for opening tags with data-locked="true"
    const openTagRegex = /<(mj-[\w-]+|[\w-]+)[^>]*data-locked="true"[^>]*>/gi;
    let match;

    while ((match = openTagRegex.exec(line)) !== null) {
      const tagName = match[1].toLowerCase();
      // Check if it's a self-closing tag
      const isSelfClosing = match[0].endsWith("/>");

      if (isSelfClosing) {
        // Self-closing locked tag - the whole line is locked
        regions.push({
          startLine: lineNumber,
          endLine: lineNumber,
          startColumn: match.index + 1,
          endColumn: match.index + match[0].length + 1,
        });
      } else {
        // Opening tag - push to stack
        lockedStack.push({
          tagName,
          startLine: lineNumber,
          startColumn: match.index + 1,
        });
      }
    }

    // Check for closing tags that match our locked stack
    if (lockedStack.length > 0) {
      const closingTagRegex = /<\/(mj-[\w-]+|[\w-]+)>/gi;
      while ((match = closingTagRegex.exec(line)) !== null) {
        const closingTagName = match[1].toLowerCase();

        // Find matching opening tag in stack (from top)
        for (let j = lockedStack.length - 1; j >= 0; j--) {
          if (lockedStack[j].tagName === closingTagName) {
            const openTag = lockedStack.splice(j, 1)[0];
            regions.push({
              startLine: openTag.startLine,
              endLine: lineNumber,
              startColumn: 1,
              endColumn: lines[lineNumber - 1].length + 1,
            });
            break;
          }
        }
      }
    }
  }

  return regions;
}

/**
 * Check if a range overlaps with any locked region
 */
export function isRangeInLockedRegion(range: IRange, lockedRegions: LockedRegion[]): boolean {
  for (const region of lockedRegions) {
    // Check if the edit range overlaps with the locked region
    const rangeStartsBeforeRegionEnds =
      range.startLineNumber < region.endLine ||
      (range.startLineNumber === region.endLine && range.startColumn <= region.endColumn);

    const rangeEndsAfterRegionStarts =
      range.endLineNumber > region.startLine ||
      (range.endLineNumber === region.startLine && range.endColumn >= region.startColumn);

    if (rangeStartsBeforeRegionEnds && rangeEndsAfterRegionStarts) {
      return true;
    }
  }
  return false;
}
