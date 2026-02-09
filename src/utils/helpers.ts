import type { TodoId } from '../models/TodoModel';

/**
 * Centralized helpers keep business logic out of UI components.
 */
export function nowIso(): string {
  return new Date().toISOString();
}

export function normalizeTitle(input: string): string {
  // Collapse whitespace and trim to avoid accidental empty/ugly titles.
  return input.replace(/\s+/g, ' ').trim();
}

/**
 * ISO timestamps sort lexicographically, so we can compare as strings.
 */
export function compareIsoDesc(a: string, b: string): number {
  if (a === b) return 0;
  return a > b ? -1 : 1;
}

/**
 * Calculates the next available TODO ID by finding the maximum existing ID and adding 1.
 * Used when loading todos from API to ensure new todos get unique IDs that don't conflict with existing ones.
 */
export function nextTodoIdFromExisting(existingIds: readonly (string | number)[]): TodoId {
  let max = 0;
  for (const id of existingIds) {
    const n = typeof id === 'number' ? id : Number(id);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return (max + 1) as TodoId;
}


