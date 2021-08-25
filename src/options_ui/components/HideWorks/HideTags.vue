<template lang="pug">
div
  boolean-option(
    :options.sync='syncOptions',
    :id='option.hideTags',
    title='Hide works based on their tags',
    subtitle='You can also add fandoms to hide here'
  )
    div
      v-divider.mx-4
      tag-option(
        :options.sync='syncOptions',
        :id='option.hideTagsDenyList',
        title='Hide works with these tags/fandoms:'
      )
      tag-option(
        :options.sync='syncOptions',
        :id='option.hideTagsAllowList',
        title='...unless the work also has one of these tags/fandoms:'
      )
      tip The easiest way to add tags to these lists, is to simply right click on a tag on AO3 and then choosing to add it to the hide list.
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';

import { Options, options } from '@/common/options';

import BooleanOption from '../BooleanOption.vue';
import Tip from '../Tip.vue';
import TagOption from '../TagOption.vue';

@Component({
  components: {
    Tip,
    BooleanOption,
    TagOption,
  },
})
export default class HideAuthors extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;

  option = options.IDS;

  colors = ['green', 'purple', 'indigo', 'cyan', 'teal', 'orange'];
}
</script>
