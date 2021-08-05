declare module 'vuetify/lib/directives/*' {
  import { DirectiveOptions, DirectiveFunction } from 'vue';
  const directive: DirectiveOptions | DirectiveFunction;
  export default directive;
}
