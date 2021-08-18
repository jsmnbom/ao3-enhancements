declare module 'vue-loader/lib/plugin' {
  class VueLoaderPlugin {
    apply(): void;
  }
  export default VueLoaderPlugin;
}

declare module 'vuetify-loader/lib/plugin' {
  class VuetifyLoaderPlugin {
    apply(): void;
  }
  export default VuetifyLoaderPlugin;
}

declare module 'webpack/lib/web/JsonpTemplatePlugin' {
  class JsonpTemplatePlugin {
    apply(): void;
  }
  export default JsonpTemplatePlugin;
}
