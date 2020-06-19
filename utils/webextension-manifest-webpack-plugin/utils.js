const deepcopy = require('deepcopy');

const VENDORS = ['firefox', 'chrome'];

function isPlainObject(value) {
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}

// Iterate over plain objects in nested objects and arrays
function* deepIteratePlainObjects(item) {
  if (Array.isArray(item)) {
    // Got an array, check its elements
    for (let x of item) {
      yield* deepIteratePlainObjects(x);
    }
  } else if (isPlainObject(item)) {
    // Got a plain object, yield it
    yield item;
    // Check its properties
    for (let x of Object.values(item)) {
      yield* deepIteratePlainObjects(x);
    }
  }
}

const objectMap = (obj, fn) =>
  Object.fromEntries(Object.entries(obj).map(([k, v], i) => fn(k, v, i)));

const objectMapFilter = (obj, fn) =>
  Object.fromEntries(
    Object.entries(obj)
      .map(([k, v], i) => fn(k, v, i))
      .filter((o) => o !== null)
  );

function convertVendorKeys(manifest, targetVendor) {
  manifest = deepcopy(manifest);
  // Convert vendor keys
  for (const obj of deepIteratePlainObjects(manifest)) {
    const newObj = objectMapFilter(obj, (key, val) => {
      const pattern = new RegExp(`^__(?:\\+?(${VENDORS.join('|')}))*_(.*)__$`);
      const found = key.match(pattern);
      if (found) {
        const keyVendors = found[1];
        if (!keyVendors.includes(targetVendor)) return null;
        key = found[2];
      }
      //if (val === '__VERSION__') val = package.version;
      return [key, val];
    });
    for (const key of Object.keys(obj)) delete obj[key];
    Object.assign(obj, newObj);
  }
  return manifest;
}

module.exports = {
  VENDORS,
  convertVendorKeys,
  deepIteratePlainObjects,
  objectMapFilter,
  objectMap,
};
