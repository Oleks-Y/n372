export interface IEntityCache<K extends CacheKey, V> {
  get(key: K): Promise<V | undefined>;
  set(key: K, value: V): Promise<void>;
  fetch(key: K, fetcher: () => Promise<V>): Promise<V>;
  delete(key: K): Promise<void>;
  take(key: K): Promise<V | undefined>;
  flush(): Promise<void>;
}

export type CacheKey = string | number | symbol;

export type ILogger = {
  info: (message: string) => void;
  error: (message: string) => void;
  warn: (message: string) => void;
  debug: (message: string) => void;
};
