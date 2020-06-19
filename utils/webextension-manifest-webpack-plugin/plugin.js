'use strict';

const { RawSource } = require('webpack-sources');
const webpack = require('webpack');
const stripJsonComments = require('strip-json-comments');
const deepcopy = require('deepcopy');
const { interpolateName } = require('loader-utils');
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
const path = require('path');
const {
  convertVendorKeys,
  deepIteratePlainObjects,
  objectMapFilter,
  VENDORS,
} = require('./utils');
const entryFileStore = require('./entryFileStore');
const fs = require('fs');

const PLUGIN_NAME = 'WebextensionManifestPlugin';

class WebextensionManifestPlugin {
  constructor(options) {
    this[PLUGIN_NAME] = true;
    this.options = options;
  }

  apply(compiler) {
    const logger = compiler.getInfrastructureLogger(PLUGIN_NAME);

    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      // Triggered when an asset from a chunk was added to the compilation.
      compilation.hooks.chunkAsset.tap(PLUGIN_NAME, (chunk, file) => {
        // Only handle js files with entry modules
        if (!file.endsWith('.js') || !chunk.hasEntryModule()) {
          return;
        }

        logger.info('GOT HERE!');

        // // Returns path containing name of asset
        // const resource: null | string = getEntryResource(chunk.entryModule);
        // const isManifest: boolean =
        //   (resource && /manifest\.json$/.test(resource)) || false;

        // if (isManifest) {
        //   chunk.files = chunk.files.filter((f: string): boolean => {
        //     return f !== file;
        //   });

        //   delete compilation.assets[file];
        //   console.unicorn(`${PLUGIN_NAME}: removed ${file}`, 29);
        // }
      });
    });

    compiler.hooks.make.tapAsync(PLUGIN_NAME, async (compilation, callback) => {
      logger.info(compiler.options.entry);
      logger.info(compilation.assets);

      //logger.info(compilation.getModule('manifest'));

      const outputOptions = deepcopy(compiler.options);

      const manifestContent = fs.readFileSync(
        path.resolve(outputOptions.context, this.options.manifest),
        { encoding: 'utf8' }
      );

      let manifest = JSON.parse(stripJsonComments(manifestContent));

      // for (const obj of deepIteratePlainObjects(manifest)) {
      //   const newObj = objectMapFilter(obj, (key, val) => {
      //     const pattern = new RegExp(
      //       `^__(?:\\+?(${VENDORS.join('|')}))*_(.*)__$`
      //     );
      //     const found = key.match(pattern);
      //     if (found) {
      //       const keyVendors = found[1];
      //       if (!keyVendors.includes(this.options.targetVendor)) return null;
      //       key = found[2];
      //     }
      //     //if (val === '__VERSION__') val = package.version;
      //     return [key, val];
      //   });
      //   for (const key of Object.keys(obj)) delete obj[key];
      //   Object.assign(obj, newObj);
      // }

      manifest = convertVendorKeys(manifest, this.options.targetVendor);

      logger.info(manifest);

      const entryFiles = {};

      // Content scripts
      if (manifest.content_scripts) {
        manifest.content_scripts.forEach((entry) => {
          if (entry.js)
            entry.js.forEach(
              (val, i) => (entryFiles[`content_script_${i}`] = val)
            );
        });
      }

      const childCompiler = compilation.createChildCompiler(
        PLUGIN_NAME,
        outputOptions
      );

      childCompiler.context = compiler.context;
      childCompiler.inputFileSystem = compiler.inputFileSystem;
      childCompiler.outputFileSystem = compiler.outputFileSystem;

      const plugins = (outputOptions.plugins || []).filter(
        (p) => p[PLUGIN_NAME] !== true
      );
      logger.info('entryFiles:', entryFiles);
      for (const [name, file] of Object.entries(entryFiles)) {
        plugins.push(new SingleEntryPlugin(compiler.context, file, name));
      }

      for (const plugin of plugins) {
        if (plugin.apply) plugin.apply(childCompiler);
      }

      childCompiler.hooks.afterCompile.tap(PLUGIN_NAME, (compilation) => {
        for (const entrypoint of compilation._preparedEntrypoints) {
          entryFileStore.addEntrypoint(entrypoint.request, entrypoint.name);
        }
      });

      // compilation.hooks.additionalAssets.tapAsync(
      //   PLUGIN_NAME,
      //   (childProcessDone) => {
      childCompiler.runAsChild((err, entries, childCompilation) => {
        logger.info('After child run.');
        if (err) {
          return callback(err);
        }

        if (childCompilation.errors.length > 0) {
          return callback(childCompilation.errors[0]);
        }

        callback();
      });
      // }
      // );

      //callback();
      // for (const entryFile of entryFileStore.entryFiles) {
      //   compiler.apply(
      //     new SingleEntryPlugin(this.context, entryFile, entryFile)
      //   );
      // }
      // compilation.hooks.additionalAssets.tap(
      //   PLUGIN_NAME,
      //   () => {
      //   }
      // );
    });
  }
}

module.exports = WebextensionManifestPlugin;
