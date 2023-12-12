import { CacheKey, IEntityCache, ILogger } from "./types";

type CacheItem<V> = {
  value: V;
  cachedAt: number;
};

type ItemDeleteCallback<V> = ((value: V) => Promise<void>) | undefined;

export class EntityCache<K extends CacheKey, V> implements IEntityCache<K, V> {
  private itemTtl: number = 0;
  private cache: Map<K, CacheItem<V>> = new Map<K, CacheItem<V>>();
  private onItemDelete: ItemDeleteCallback<V>;

  constructor(itemTtl: number, onItemDelete?: ItemDeleteCallback<V>) {
    this.itemTtl = itemTtl;
    this.onItemDelete = onItemDelete;
  }

  async get(key: K) {
    const item = this.cache.get(key);

    if (!item) {
      return undefined;
    }

    if (Date.now() - item.cachedAt > this.itemTtl) {
      this.delete(key);
      return undefined;
    }

    return item.value;
  }

  async set(key: K, value: V) {
    this.cache.set(key, {
      value,
      cachedAt: Date.now(),
    });
  }

  async fetch(key: K, fetcher: () => Promise<V>): Promise<V> {
    if (this.cache.has(key)) {  
      return Promise.resolve(this.cache.get(key)!.value);
    }

    return fetcher();
  }

  async delete(key: K) {
    if (this.onItemDelete) {
      const item = this.cache.get(key);

      if (item) {
        await this.onItemDelete(item.value);
      }
    }

    this.cache.delete(key);
  }

  async take(key: K) {
    const item = this.get(key);
    this.delete(key);
    return item;
  }

  async flush() {
    this.cache.clear();
  }

  cacheExpired(cachedAt: number): boolean {
    return Date.now() - cachedAt > this.itemTtl;
  }
}
