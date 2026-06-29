/**
 * Build a safe PostgreSQL `to_tsquery` prefix expression from raw user input.
 * The result is always passed as a bound parameter (never string-concatenated
 * into SQL), but we still sanitize to avoid tsquery syntax errors and abuse.
 */
const MAX_TERMS = 8;
const MAX_TERM_LENGTH = 50;

/** Tokenize input into safe alphanumeric terms (diacritics kept, symbols dropped). */
export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 0)
    .slice(0, MAX_TERMS)
    .map((t) => t.slice(0, MAX_TERM_LENGTH));
}

/**
 * Produce a prefix tsquery like `invoice:* & 2026:*`.
 * Returns an empty string when there is nothing searchable (caller should skip FTS).
 */
export function toPrefixTsQuery(input: string): string {
  const terms = tokenize(input);
  if (terms.length === 0) return "";
  return terms.map((t) => `${t}:*`).join(" & ");
}
