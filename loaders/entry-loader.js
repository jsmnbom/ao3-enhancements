const path = require('path');
const loaderUtils = require('loader-utils');
const { EntryPlugin } = require('webpack');

module.exports = function () {};

module.exports.pitch = function (request) {
  const callback = this.async();

  const options = loaderUtils.getOptions(this) || {};
  const context = options.context || this.rootContext;
  const name = options.name || path.basename(this.resourcePath);
  const filename = loaderUtils.interpolateName(this, name, {
    context: context,
  });
  const outputDir = options.path || '.';
  const plugins = options.plugins || [];
  const query = loaderUtils.parseQuery(this.resourceQuery);

  const getData = (files) => {
    const outputFilename = files.find((file) =>
      file.endsWith(query.css ? '.css' : '.js')
    );
    return (
      'module.exports = __webpack_public_path__ + ' +
      JSON.stringify(path.join(outputDir, outputFilename)) +
      ';'
    );
  };

  // name of the entry and compiler (in logs)
  const debugName = loaderUtils.interpolateName(this, '[name]', {});

  // Cache stuffs
  if (this._compiler.entryLoaderCache === undefined)
    this._compiler.entryLoaderCache = {};
  if (process.env.NODE_ENV === 'production') {
    if (this._compiler.entryLoaderCache[filename] !== undefined) {
      this._compiler.entryLoaderCache[filename].push((files) => {
        callback(null, getData(files));
      });
      return;
    }
  }

  // create a child compiler (hacky)
  const compiler = this._compilation.createChildCompiler(
    debugName,
    { filename: filename },
    plugins
  );
  this._compiler.entryLoaderCache[filename] = [];

  // add our new entry point
  new EntryPlugin(this.context, '!!' + request, debugName).apply(compiler);

  // add a dependency so watch mode works
  this.addDependency(this.resourcePath);

  // needed later
  const that = this;

  const startTime = Date.now();

  // like compiler.runAsChild(), add dependencies
  compiler.compile(
    function (err, compilation) {
      if (err) return callback(err);

      this.parentCompilation.children.push(compilation);
      for (const { name, source, info } of compilation.getAssets()) {
        this.parentCompilation.emitAsset(name, source, info);
      }

      // add dependencies
      compilation.fileDependencies.forEach((dep) => {
        that.addDependency(dep);
      }, that);

      compilation.contextDependencies.forEach((dep) => {
        that.addContextDependency(dep);
      }, that);

      compilation.startTime = startTime;
      compilation.endTime = Date.now();

      const files = Array.from(
        compilation.entrypoints.values().next().value.chunks[0].files
      );

      callback(null, getData(files));
      for (const cb of this.parentCompilation.compiler.entryLoaderCache[
        filename
      ]) {
        cb(files);
      }
    }.bind(compiler)
  );
};
