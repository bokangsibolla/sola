// Silence Expo's import.meta registry which isn't available in Jest
globalThis.__ExpoImportMetaRegistry = {
  url: 'file:///test',
};

// Minimal react-native jest globals (replaces react-native/jest/setup.js
// which ships Flow syntax that Babel can't parse without the RN preset)
Object.defineProperties(global, {
  __DEV__: { configurable: true, enumerable: true, value: true, writable: true },
  requestAnimationFrame: {
    configurable: true,
    enumerable: true,
    value: function(cb) { return setTimeout(function() { cb(Date.now()); }, 0); },
    writable: true,
  },
  cancelAnimationFrame: {
    configurable: true,
    enumerable: true,
    value: function(id) { return clearTimeout(id); },
    writable: true,
  },
  window: { configurable: true, enumerable: true, value: global, writable: true },
});
