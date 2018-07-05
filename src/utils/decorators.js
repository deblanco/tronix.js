const requireAllParams = fn => function methodDecorated(...args) {
  if (args.length < fn.length) {
    const fnArguments = fn.toString().match(/\((.*)\)/)[1];
    throw new Error(`Function "${fn.name}" has missing required arguments: ${fnArguments}`);
  } else {
    return fn.call(this, ...args);
  }
};

const applyClassDecorator = (classDef, decorator) => {
  const properties = Object.getOwnPropertyNames(classDef.prototype).filter(x => x !== 'constructor');
  properties.forEach((property) => {
    Object.defineProperty(
      classDef.prototype,
      property,
      { value: decorator(classDef.prototype[property]) },
    );
  });
  return classDef;
};

module.exports = {
  applyClassDecorator,
  requireAllParams,
};
