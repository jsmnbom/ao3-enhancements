const stripJsonComments = require('strip-json-comments');
const { getOptions, urlToRequest, stringifyRequest } = require('loader-utils');
const validateOptions = require('schema-utils');
const deepmerge = require('deepmerge');

const { convertVendorKeys, VENDORS, objectMap } = require('./utils');

const schema = {
  type: 'object',
  properties: {
    targetVendor: {
      type: 'string',
    },
    merge: {
      type: 'object',
      additionalProperties: true,
    },
  },
};

module.exports = function (source) {
  const done = this.async();
  const options = getOptions(this) || { merge: {} };

  validateOptions(schema, options, 'Webextension Manifest Loader');

  const targetVendor = options.targetVendor;

  if (!VENDORS.includes(targetVendor)) {
    done(
      new Error(
        `options.targetVendor must be set to one of ${VENDORS}, not ${targetVendor}.`
      )
    );
    return;
  }

  // Get as object
  let manifest = JSON.parse(stripJsonComments(source));

  manifest = convertVendorKeys(manifest, targetVendor);

  manifest = deepmerge(manifest, options.merge);

  const result = { messages: [] };
  const content = sourceExtract(manifest, result);

  result.manifest = content;

  const importedMessages = [];
  const replaceableMessages = [];

  for (const message of result.messages) {
    // eslint-disable-next-line default-case
    switch (message.type) {
      case 'import':
        importedMessages.push(message.value);
        break;
      case 'replacer':
        replaceableMessages.push(message.value);
        break;
    }
  }

  const importCode = getImportCode(importedMessages, this);
  const moduleCode = getModuleCode(result.manifest, replaceableMessages);
  const exportCode = `export default JSON.stringify(code, null, 2);`;

  const out = `${importCode}${moduleCode}${exportCode}`;
  done(null, out);
};

const GET_SOURCE_FROM_IMPORT_NAME =
  '___WEBEXTENSION_MANIFEST_LOADER_GET_SOURCE_FROM_IMPORT___';

const getImportCode = (messages, context) => {
  const stringifiedHelperRequest = stringifyRequest(
    context,
    require.resolve('./runtime/getUrl.js')
  );

  let code = `var ${GET_SOURCE_FROM_IMPORT_NAME} = require(${stringifiedHelperRequest});\n`;

  for (const item of messages) {
    const { importName, source } = item;
    const stringifiedSourceRequest = stringifyRequest(context, source);

    code += `var ${importName} = require(${stringifiedSourceRequest});\n`;
  }

  return `// Imports\n${code}`;
};

const getModuleCode = (manifest, messages) => {
  let code = JSON.stringify(manifest);

  let replacersCode = '';

  for (const item of messages) {
    const { importName, replacerName } = item;

    replacersCode += `var ${replacerName} = ${GET_SOURCE_FROM_IMPORT_NAME}(${importName});\n`;

    code = code.replace(
      new RegExp(`"${replacerName}"`, 'g'),
      () => replacerName
    );
  }
  return `// Module\n${replacersCode}var code = ${code};\n`;
};

const sourceExtract = (manifest, result) => {
  const importsMap = new Map();
  const replacersMap = new Map();

  const extract = sourceExtractSingle(importsMap, replacersMap, result);

  // Icons
  if (manifest.icons) {
    manifest.icons = objectMap(manifest.icons, (key, val) => [
      key,
      extract(val),
    ]);
  }

  // Content scripts
  if (manifest.content_scripts) {
    manifest.content_scripts = manifest.content_scripts.map((entry) => {
      if (entry.js) entry.js = entry.js.map((val) => extract(val));
      if (entry.css) entry.css = entry.css.map((val) => extract(val));
      return entry;
    });
  }

  // Background scripts
  if (manifest.background) {
    if (manifest.background.scripts) {
      manifest.background.scripts = manifest.background.scripts.map((val) =>
        extract(val)
      );
    }
    if (manifest.background.page) {
      manifest.background.page = extract(manifest.background.page);
    }
  }

  // Options ui
  if (manifest.options_ui) {
    if (manifest.options_ui.page) {
      manifest.options_ui.page = extract(manifest.options_ui.page);
    }
  }

  // Web accessible resources
  if (manifest.web_accessible_resources) {
    manifest.web_accessible_resources = manifest.web_accessible_resources.map(
      (val) => extract(val)
    );
  }

  return manifest;
};

const sourceExtractSingle = (importsMap, replacersMap, result) => (value) => {
  const importKey = urlToRequest(decodeURIComponent(value));
  let importName = importsMap.get(importKey);

  if (!importName) {
    importName = `___WEBEXTENSION_MANIFEST_LOADER_IMPORT_${importsMap.size}___`;
    importsMap.set(importKey, importName);

    result.messages.push({
      type: 'import',
      value: {
        source: importKey,
        importName,
      },
    });
  }

  const replacerKey = importKey;
  let replacerName = replacersMap.get(replacerKey);

  if (!replacerName) {
    replacerName = `___WEBEXTENSION_MANIFEST_LOADER_REPLACER_${replacersMap.size}___`;
    replacersMap.set(replacerKey, replacerName);

    result.messages.push({
      type: 'replacer',
      value: {
        importName,
        replacerName,
      },
    });
  }

  return replacerName;
};
