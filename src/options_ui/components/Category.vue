<template lang="pug">
v-sheet.pb-1.pt-3.mb-6.rounded(elevation='4', :id='id')
  div(
    v-intersect='{handler: onIntersect, options: {threshold: [0, 0.1, 0.9, 1.0]}}'
  )
    v-row.ma-0
      v-col.pl-4.pr-0.py-0
        span.text-h6.d-inline-block.font-weight-regular {{ title }}
        p.text-subtitle-2.font-weight-light {{ subtitle }}
      v-col(cols='auto')
        v-icon.mt-n1.mr-2(large) {{ icon }}
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
