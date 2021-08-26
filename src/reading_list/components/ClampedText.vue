<template lang="pug">
div(v-frag)
  .wrap(ref='wrap'): slot
  v-btn.button(plain, small, v-if='button', color='primary', @click='showMore') show more
</template>

<script lang="ts">
import { Component, Vue, Prop, Ref } from 'vue-property-decorator';
@Component({
  components: {},
})
export default class ClampedText extends Vue {
  @Prop() lines!: number;
  @Ref() wrap!: HTMLParagraphElement;

  button = false;

  async mounted(): Promise<void> {
    const lineHeight = window.getComputedStyle(
      this.$slots.default![0].elm! as Element
    ).lineHeight;
    this.wrap.style.maxHeight = `calc(${lineHeight} * ${this.lines + 0.5})`;

    await this.$nextTick();
    this.button = this.wrap.scrollHeight > this.wrap.clientHeight + 16;
  }

  showMore(): void {
    this.wrap.style.maxHeight = `${this.wrap.scrollHeight}px`;
    this.button = false;
  }
}
</script>

<style lang="scss" scoped>
@import '~vuetify/src/styles/settings/_variables';
.wrap {
  overflow-y: hidden;
  transition: 0.3s map-get($transition, 'fast-in-fast-out');
}
.button {
  margin: 0 auto;
  display: block;
}
</style>
