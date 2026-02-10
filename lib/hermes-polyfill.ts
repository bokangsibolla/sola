/**
 * Hermes polyfill for Set/Map iteration.
 *
 * Some Hermes versions have Symbol.iterator on Set/Map but the iterator
 * it returns is broken. This polyfill TESTS actual spread behavior and
 * patches if it fails.
 *
 * Must be imported BEFORE any other code.
 */

/* eslint-disable no-extend-native */

function makeArrayIterator(arr: any[]): any {
  let i = 0;
  return {
    next() {
      return i < arr.length
        ? { value: arr[i++], done: false }
        : { value: undefined, done: true };
    },
    [Symbol.iterator]() {
      return this;
    },
  };
}

// Test if Set spread actually works at runtime
let setSpreadWorks = false;
try {
  const s = new Set([1, 2]);
  const arr = [...s];
  setSpreadWorks = arr.length === 2;
} catch {
  setSpreadWorks = false;
}

if (!setSpreadWorks) {
  (Set.prototype as any)[Symbol.iterator] = function (this: Set<any>) {
    const items: any[] = [];
    this.forEach((v) => items.push(v));
    return makeArrayIterator(items);
  };
  (Set.prototype as any).values = function (this: Set<any>) {
    const items: any[] = [];
    this.forEach((v) => items.push(v));
    return makeArrayIterator(items);
  };
  (Set.prototype as any).keys = (Set.prototype as any).values;
  (Set.prototype as any).entries = function (this: Set<any>) {
    const items: any[] = [];
    this.forEach((v) => items.push([v, v]));
    return makeArrayIterator(items);
  };
}

// Test if Map spread actually works at runtime
let mapSpreadWorks = false;
try {
  const m = new Map([['a', 1]]);
  const arr = [...m];
  mapSpreadWorks = arr.length === 1;
} catch {
  mapSpreadWorks = false;
}

if (!mapSpreadWorks) {
  (Map.prototype as any)[Symbol.iterator] = function (this: Map<any, any>) {
    const entries: any[] = [];
    this.forEach((v, k) => entries.push([k, v]));
    return makeArrayIterator(entries);
  };
  (Map.prototype as any).keys = function (this: Map<any, any>) {
    const keys: any[] = [];
    this.forEach((_v, k) => keys.push(k));
    return makeArrayIterator(keys);
  };
  (Map.prototype as any).values = function (this: Map<any, any>) {
    const values: any[] = [];
    this.forEach((v) => values.push(v));
    return makeArrayIterator(values);
  };
  (Map.prototype as any).entries = function (this: Map<any, any>) {
    const entries: any[] = [];
    this.forEach((v, k) => entries.push([k, v]));
    return makeArrayIterator(entries);
  };
}
