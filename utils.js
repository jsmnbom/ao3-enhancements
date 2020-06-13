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

const objectMapFilter = (obj, fn) =>
  Object.fromEntries(
    Object.entries(obj)
      .map(([k, v], i) => fn(k, v, i))
      .filter((o) => o !== null)
  );

module.exports = {
  deepIteratePlainObjects,
  objectMapFilter,
};
