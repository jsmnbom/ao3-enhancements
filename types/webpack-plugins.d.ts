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

declare module 'inert-entry-webpack-plugin' {
  class InertEntryPlugin {
    apply(): void;
  }
  export default InertEntryPlugin;
}
