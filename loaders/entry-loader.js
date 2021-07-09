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

  // name of the entry and compiler (in logs)
  const debugName = loaderUtils.interpolateName(this, '[name]', {});

  // create a child compiler (hacky)
  const compiler = this._compilation.createChildCompiler(
    debugName,
    { filename: filename },
    plugins
  );
  // add our new entry point
  new EntryPlugin(this.context, '!!' + request, debugName).apply(compiler);

  // add a dependency so watch mode works
  this.addDependency(this.resourcePath);

  // needed later
  const that = this;

  // like compiler.runAsChild(), but remaps paths if necessary
  // https://github.com/webpack/webpack/blob/f6e366b4be1cfe2770251a890d93081824789209/lib/Compiler.js#L206
  compiler.compile(
    function (err, compilation) {
      if (err) return callback(err);

      // add the assets to the parent, so they show up in stats
      this.parentCompilation.children.push(compilation);
      for (const name of Object.keys(compilation.assets)) {
        this.parentCompilation.assets[path.join(outputDir, name)] =
          compilation.assets[name];
      }

      // add dependencies
      compilation.fileDependencies.forEach((dep) => {
        that.addDependency(dep);
      }, that);

      compilation.contextDependencies.forEach((dep) => {
        that.addContextDependency(dep);
      }, that);

      // the first file in the first chunk of the first (should only be one) entry point is the real file
      // see https://github.com/webpack/webpack/blob/f6e366b4be1cfe2770251a890d93081824789209/lib/Compiler.js#L215
      const outputFilename = compilation.entrypoints
        .values()
        .next()
        .value.chunks[0].files.values()
        .next().value;

      callback(
        null,
        'module.exports = __webpack_public_path__ + ' +
          JSON.stringify(path.join(outputDir, outputFilename)) +
          ';'
      );
    }.bind(compiler)
  );
};
