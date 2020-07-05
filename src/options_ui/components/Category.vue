<template lang="pug">
.pt-4(
  :id='id',
  v-intersect='{handler: onIntersect, options: {threshold: [0, 0.1, 0.9, 1.0]}}'
)
  span.text-h5.d-inline-block {{ title }}
  v-divider
  p.text--secondary.subtitle {{ subtitle }}

  slot
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Category extends Vue {
  @Prop(String) readonly icon: string | undefined;
  @Prop(String) readonly id: string | undefined;
  @Prop(String) readonly title: string | undefined;
  @Prop(String) readonly subtitle: string | undefined;

  created(): void {
    this.$emit('category-add-nav', {
      icon: this.icon,
      id: this.id,
      title: this.title,
    });
  }

  onIntersect(entries: IntersectionObserverEntry[]): void {
    this.$emit('category-on-intersect', {
      id: this.id,
      isIntersecting: entries[0].intersectionRatio >= 0.1,
    });
  }
}
</script>
