let vueLoaderPath;
try {
  vueLoaderPath = require.resolve('vue-loader');
} catch (err) {}

function isVueLoader(use) {
  return (
    use.ident === 'vue-loader-options' ||
    use.loader === 'vue-loader' ||
    (vueLoaderPath && use.loader === vueLoaderPath)
  );
}

function getVueRules(rules) {
  const vuetify = rules
    .filter(
      (rule) =>
        rule.oneOf &&
        rule.oneOf.length == 2 &&
        rule.oneOf[0].resourceQuery &&
        rule.oneOf[0].resourceQuery === '?' &&
        rule.oneOf[1].use &&
        rule.oneOf[1].use.length == 2 &&
        isVueLoader(rule.oneOf[1].use[1])
    )
    .map((rule) => rule.oneOf[1]);

  return [
    ...vuetify,
    ...rules.filter(
      (rule) => rule.use && rule.use.find && rule.use.find(isVueLoader)
    ),
  ];
}

class IconsLoaderPlugin {
  constructor(options) {
    this.options = options || {};
  }

  apply(compiler) {
    const vueRules = getVueRules(compiler.options.module.rules);

    if (!vueRules.length) {
      throw new Error(
        `[IconsLoaderPlugin Error] No matching rule for vue-loader found.\n` +
          `Make sure there is at least one root-level rule that uses vue-loader and IconsLoaderPlugin is applied after VueLoaderPlugin.`
      );
    }
    vueRules.forEach(this.updateVueRule.bind(this));
  }

  updateVueRule(rule) {
    rule.oneOf = [
      {
        resourceQuery: '?',
        use: rule.use,
      },
      {
        use: [
          {
            loader: require.resolve('./loader'),
          },
          ...rule.use,
        ],
      },
    ];
    delete rule.use;
  }
}

module.exports = IconsLoaderPlugin;
