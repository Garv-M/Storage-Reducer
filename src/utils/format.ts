const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

export const bytesToHuman = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';

  const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), BYTE_UNITS.length - 1);
  const value = bytes / 1024 ** power;
  const precision = power === 0 ? 0 : value < 10 ? 1 : 0;

  return `${value.toFixed(precision)} ${BYTE_UNITS[power]}`;
};

export const dateFmt = (timestamp: number): string => {
  if (!timestamp) return '—';

  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const pluralize = (count: number, noun: string): string =>
  `${count} ${noun}${count === 1 ? '' : 's'}`;
