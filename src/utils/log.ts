type LogArg = unknown;

export const createLogger = (tag: string) => {
  const prefix = `[${tag}]`;

  return {
    info: (...args: LogArg[]) => console.info(prefix, ...args),
    warn: (...args: LogArg[]) => console.warn(prefix, ...args),
    error: (...args: LogArg[]) => console.error(prefix, ...args),
  };
};
