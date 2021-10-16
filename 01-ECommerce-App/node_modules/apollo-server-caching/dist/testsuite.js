"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runKeyValueCacheTests = void 0;
async function runKeyValueCacheTests(keyValueCache, tick) {
    await keyValueCache.set('hello', 'world');
    assertEqual(await keyValueCache.get('hello'), 'world');
    assertEqual(await keyValueCache.get('missing'), undefined);
    await keyValueCache.set('hello2', 'world');
    assertEqual(await keyValueCache.get('hello2'), 'world');
    await keyValueCache.delete('hello2');
    assertEqual(await keyValueCache.get('hello2'), undefined);
    if (tick) {
        await keyValueCache.set('short', 's', { ttl: 1 });
        await keyValueCache.set('long', 'l', { ttl: 5 });
        assertEqual(await keyValueCache.get('short'), 's');
        assertEqual(await keyValueCache.get('long'), 'l');
        tick(1500);
        assertEqual(await keyValueCache.get('short'), undefined);
        assertEqual(await keyValueCache.get('long'), 'l');
        tick(4000);
        assertEqual(await keyValueCache.get('short'), undefined);
        assertEqual(await keyValueCache.get('long'), undefined);
        await keyValueCache.set('forever', 'yours', { ttl: null });
        assertEqual(await keyValueCache.get('forever'), 'yours');
        tick(1500);
        assertEqual(await keyValueCache.get('forever'), 'yours');
        tick(4000);
        assertEqual(await keyValueCache.get('forever'), 'yours');
    }
}
exports.runKeyValueCacheTests = runKeyValueCacheTests;
function assertEqual(actual, expected) {
    if (actual === expected) {
        return;
    }
    throw Error(`Expected ${actual} to equal ${expected}`);
}
//# sourceMappingURL=testsuite.js.map