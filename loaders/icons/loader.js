const path = require('path');
const loaderUtils = require('loader-utils');

function install(content, icons) {
  if (icons.length) {
    let newContent = '/* icons-loader */\n';
    newContent += `import installIcons from ${loaderUtils.stringifyRequest(
      this,
      '!' + require.resolve('./runtime.js')
    )}\n`;
    newContent += `import {${icons.join(
      ','
    )}} from ${loaderUtils.stringifyRequest(
      this,
      '!' + require.resolve('@mdi/js')
    )};\n`;
    newContent += `installIcons(component, {${icons.join(',')}})\n`;

    // Insert our modification before the HMR code
    const hotReload = content.indexOf('/* hot reload */');
    if (hotReload > -1) {
      content =
        content.slice(0, hotReload) +
        newContent +
        '\n\n' +
        content.slice(hotReload);
    } else {
      content += '\n\n' + newContent;
    }
  }

  return content;
}

module.exports = async function (content, sourceMap) {
  this.async();
  this.cacheable();

  if (!this.resourceQuery) {
    const readFile = (path) =>
      new Promise((resolve, reject) => {
        this.fs.readFile(path, function (err, data) {
          if (err) reject(err);
          else resolve(data);
        });
      });

    this.addDependency(this.resourcePath);
    const file = (await readFile(this.resourcePath)).toString('utf8');
    const icons = Array.from(
      new Set(Array.from(file.matchAll(/\$icons\.(mdi\w+)/g), (m) => m[1]))
    );
    content = install.call(this, content, icons);
  }

  this.callback(null, content, sourceMap);
};
