import assert from "node:assert";
import { describe, it, beforeEach, mock } from "node:test";
import { EntityCache } from "../src/EntityCache";

describe("EntityCache", function () {
  let cache: EntityCache<string, string>;

  beforeEach(() => {
    cache = new EntityCache<string, string>(1000);
  });

  it("set value", async () => {
    await cache.set("key", "value");
    const cachedValue = await (cache as any).cache.get("key");

    assert.equal(cachedValue?.value, "value");
  });

  it("get value", async () => {
    await cache.set("key", "value");
    const cachedValue = await cache.get("key");

    assert.equal(cachedValue, "value");
  });

  it("get value with expired ttl", async () => {
    mock.timers.enable();
    await cache.set("key", "value");
    mock.timers.tick(1001);
    const cachedValue = await cache.get("key");

    assert.equal(cachedValue, undefined);
    mock.timers.reset();
  });

  it("fetch missing value", async () => {
    const fetcher = () => Promise.resolve("value");
    const cachedValue = await cache.fetch("key", fetcher);

    assert.equal(cachedValue, "value");
  });

  it("don't fetch existing value", async () => {
    await cache.set("key", "value 1");
    const fetcher = () => Promise.resolve("value 2");
    const cachedValue = await cache.fetch("key", fetcher);

    assert.equal(cachedValue, "value 1");
  });

  it("delete value", async () => {
    await cache.set("key", "value");
    await cache.delete("key");
    const cachedValue = await cache.get("key");

    assert.equal(cachedValue, undefined);
  });
});
