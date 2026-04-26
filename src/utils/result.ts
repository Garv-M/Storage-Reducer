// Functional result helpers for explicit success/error returns without exceptions.
// This pattern makes async service flows easier to compose and test predictably.

// ── Result types ───────────────────────────────────────────────────────────────

/** Successful operation payload wrapper. */
export type Ok<T> = { ok: true; value: T };

/** Failed operation payload wrapper. */
export type Err<E> = { ok: false; error: E };

/** Discriminated union used to model recoverable outcomes explicitly. */
export type Result<T, E> = Ok<T> | Err<E>;

// ── Result constructors ────────────────────────────────────────────────────────

/** Creates a successful result wrapper for a computed value. */
export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });

/** Creates an error result wrapper without throwing. */
export const err = <E>(error: E): Err<E> => ({ ok: false, error });

// ── Result guards ──────────────────────────────────────────────────────────────

/** Narrows a Result to Ok for type-safe success handling branches. */
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result.ok;

/** Narrows a Result to Err for type-safe error handling branches. */
export const isErr = <T, E>(result: Result<T, E>): result is Err<E> => !result.ok;
