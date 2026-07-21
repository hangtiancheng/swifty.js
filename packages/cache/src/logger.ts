export interface Logger {
  info(msg: string): void;
  warn(msg: string): void;
  error(msg: string): void;
}

let current: Logger = {
  info: (msg) => console.log(`[SwiftyCache] ${msg}`),
  warn: (msg) => console.warn(`[SwiftyCache] ${msg}`),
  error: (msg) => console.error(`[SwiftyCache] ${msg}`),
};

export function setLogger(logger: Logger): void {
  current = logger;
}

export const log: Logger = {
  info: (msg) => current.info(msg),
  warn: (msg) => current.warn(msg),
  error: (msg) => current.error(msg),
};
