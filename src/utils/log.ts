// Lightweight logger factory that namespaces console output by feature/module.
// Tagging logs simplifies debugging when multiple async flows emit concurrently.

// ── Logger factory ─────────────────────────────────────────────────────────────

type LogArg = unknown;

/**
 * Creates scoped console log functions with a stable tag prefix.
 */
export const createLogger = (tag: string) => {
  const prefix = `[${tag}]`;

  return {
    /** Emits informational diagnostics for normal execution flow. */
    info: (...args: LogArg[]) => console.info(prefix, ...args),
    /** Emits warning diagnostics for recoverable anomalies. */
    warn: (...args: LogArg[]) => console.warn(prefix, ...args),
    /** Emits error diagnostics for failed operations. */
    error: (...args: LogArg[]) => console.error(prefix, ...args),
  };
};
