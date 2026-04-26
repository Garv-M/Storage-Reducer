// Persistence migrations track schema versioning for on-device stored data.
// Current migration flow is version-gated and idempotent.

import { mmkvGetJson, mmkvSetJson } from '@/services/persistence/mmkv';

// ── Schema Metadata ────────────────────────────────────────────────────────────

const SCHEMA_KEY = 'app_schema';
const LATEST_SCHEMA_VERSION = 1;

type SchemaState = { version: number; migratedAt: number };

// ── Migration API ──────────────────────────────────────────────────────────────

/**
 * Returns the persisted schema version, defaulting to 0 when unset.
 */
export const getSchemaVersion = (): number => {
  const schema = mmkvGetJson<SchemaState>(SCHEMA_KEY);
  return schema?.version ?? 0;
};

/**
 * Advances storage schema to the latest known version.
 *
 * The check is monotonic/idempotent: once at or above latest, no write occurs.
 */
export const runMigrations = (): number => {
  const currentVersion = getSchemaVersion();

  if (currentVersion >= LATEST_SCHEMA_VERSION) {
    return currentVersion;
  }

  const nextState: SchemaState = {
    version: LATEST_SCHEMA_VERSION,
    migratedAt: Date.now(),
  };

  mmkvSetJson(SCHEMA_KEY, nextState);
  return nextState.version;
};
