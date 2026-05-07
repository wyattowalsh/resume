const descriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

if (descriptor?.get) {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    enumerable: descriptor.enumerable,
    value: {},
    writable: true,
  });
}
