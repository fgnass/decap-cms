import { Map as ImmutableMap, List } from 'immutable';
import { vercelStegaEncode } from '@vercel/stega';

function isList(value: unknown): value is List<unknown> {
  return List.isList(value);
}

function isMap(value: unknown): value is ImmutableMap<unknown, unknown> {
  return ImmutableMap.isMap(value);
}

/**
 * Traverses an immutable data structure and encodes string values with stega.
 * Uses identity checks to minimize updates.
 */
export function encodeEntry(value: unknown, path = '') {
  const previousData = new Map<string, unknown>();
  const cache = new Map<string, unknown>();

  function visit(value: unknown, path = ''): unknown {
    const prevValue = previousData.get(path);
    if (value === prevValue) {
      return cache.get(path) ?? value;
    }
    previousData.set(path, value);

    let result;
    if (isList(value)) {
      let newList = value;
      for (let i = 0; i < newList.size; i++) {
        const item = newList.get(i);
        const newItem = visit(item, `${path}.${i}`);
        if (newItem !== item) {
          newList = newList.set(i, newItem);
        }
      }
      result = newList;
    } else if (isMap(value)) {
      let newMap = value;
      for (const [key, val] of newMap.entrySeq().toArray()) {
        const newVal = visit(val, `${path}.${key}`);
        if (newVal !== val) {
          newMap = newMap.set(key, newVal);
        }
      }
      result = newMap;
    } else if (typeof value === 'string') {
      // Extract field name from path for stega metadata
      const field = path.split('.').pop() || '';
      const stega = vercelStegaEncode({ decap: field });
      result = value + stega;
      console.log('Encoded value:', result);
    } else {
      result = value;
    }

    cache.set(path, result);
    return result;
  }

  return visit(value, path);
}
