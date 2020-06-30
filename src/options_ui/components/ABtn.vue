<template lang="pug">
button.a-btn(
  @click='$emit("click", $event)',
  :class='{ "theme--dark": this.theme.isDark, "theme--light": !this.theme.isDark }'
)
  slot
</template>

<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator';

@Component
export default class ABtn extends Vue {
  @Inject() readonly theme!: boolean;
}
</script>

<style lang="scss">
@import '~vuetify/src/styles/styles.sass';

@include theme(a-btn) using ($material) {
  color: map-deep-get($material, 'text', 'link');
  border-color: map-deep-get($material, 'text', 'link');
}

/* https://stackoverflow.com/a/12642009/3920144 */
.a-btn {
  align-items: normal;
  background-color: rgba(0, 0, 0, 0);
  border-style: none;
  box-sizing: content-box;
  cursor: pointer;
  display: inline;
  font: inherit;
  padding: 0;
  perspective-origin: 0 0;
  text-align: start;
  text-decoration: underline;
  transform-origin: 0 0;
  -moz-appearance: none;
  -webkit-logical-height: 1em; /* Chrome ignores auto, so we have to use this hack to set the correct height  */
  -webkit-logical-width: auto; /* Chrome ignores auto, but here for completeness */
}

/* Mozilla uses a pseudo-element to show focus on buttons, */
/* but anchors are highlighted via the focus pseudo-class. */

@supports (-moz-appearance: none) {
  /* Mozilla-only */
  .a-btn::-moz-focus-inner {
    /* reset any predefined properties */
    border: none;
    padding: 0;
  }
  .a-btn:focus {
    /* add outline to focus pseudo-class */
    outline-style: dotted;
    outline-width: 1px;
  }
}
</style>
