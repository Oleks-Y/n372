import { CacheKey, IEntityCache, ILogger } from "./types";

type CacheItem<V> = {
  value: V;
  cachedAt: number;
};

export class EntityCache<K extends CacheKey, V> implements IEntityCache<K, V> {
  private itemTtl: number = 0;
  private cache: Map<K, CacheItem<V>> = new Map<K, CacheItem<V>>();

  constructor(itemTtl: number) {
    this.itemTtl = itemTtl;
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key);

    if (!item) {
      return undefined;
    }

    if (Date.now() - item.cachedAt > this.itemTtl) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value;
  }

  set(key: K, value: V): void {
    this.cache.set(key, {
      value,
      cachedAt: Date.now(),
    });
  }

  async fetch(key: K, fetcher: () => Promise<V>): Promise<V> {
    if (this.cache.has(key)) {
      return Promise.resolve(this.cache.get(key) as V);
    }

    return fetcher();
  }

  delete(key: K): void {
    this.cache.delete(key);
  }

  take(key: K): V | undefined {
    // const item = this.cache.get(key)?.value;
    const item = this.get(key);
    this.cache.delete(key);
    return item;
  }

  flush(): void {
    this.cache.clear();
  }

  cacheExpired(cachedAt: number): boolean {
    return Date.now() - cachedAt > this.itemTtl;
  }
}
