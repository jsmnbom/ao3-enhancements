// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

module.exports = function installIcons(component, icons) {
  // THIS IS INSANELY HACKY BUT WHO CARES
  const options = component.options;
  options.beforeCreate = options.beforeCreate || [];
  options.beforeCreate.push(function () {
    this.$icons = icons;
  });
};
