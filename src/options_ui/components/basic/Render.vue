<script lang="ts">
import type { PropType, RenderFunction, VNodeChild } from 'vue'

import { defineComponent } from 'vue'

export type Renderable = VNodeChild | RenderFunction

const Render = defineComponent({
  name: 'Render',
  props: {
    render: {
      type: null as unknown as PropType<Renderable>,
      required: true,
    },
  },
  setup(props) {
    return typeof props.render === 'function' ? props.render : () => props.render
  },
})

export default Render
</script>
