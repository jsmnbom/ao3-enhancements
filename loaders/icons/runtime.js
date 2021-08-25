// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

module.exports = function installIcons(component, icons) {
  var options =
    typeof component.exports === 'function'
      ? component.exports.extendOptions
      : component.options;

  options.mixins.push({
    beforeCreate: function () {
      this.$icons = icons;
    },
  });
};
