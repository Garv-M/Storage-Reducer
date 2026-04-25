import { mmkvGetJson, mmkvSetJson } from '@/services/persistence/mmkv';

const SCHEMA_KEY = 'app_schema';
const LATEST_SCHEMA_VERSION = 1;

type SchemaState = { version: number; migratedAt: number };

export const getSchemaVersion = (): number => {
  const schema = mmkvGetJson<SchemaState>(SCHEMA_KEY);
  return schema?.version ?? 0;
};

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
