export interface IEntityCache<K extends CacheKey, V> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  fetch(key: K, fetcher: () => Promise<V>): Promise<V>;
  delete(key: K): void;
  take(key: K): V | undefined;
  has(key: K): boolean;
  flush(): void;
}

export type CacheKey = string | number | symbol;

export type ILogger = {
  info: (message: string) => void;
  error: (message: string) => void;
  warn: (message: string) => void;
  debug: (message: string) => void;
};
