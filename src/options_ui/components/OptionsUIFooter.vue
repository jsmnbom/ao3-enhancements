<script setup lang="ts">
import { onMounted } from 'vue'

import { useSize } from '../composables/useSize.js'

const footerSize = useSize('footer')

onMounted(() => {
  footerSize.set()
})
</script>

<template>
  <footer class="dark prose" flex="~ col gap2" px-4 py-12 text="white sm">
    <p>
      Please note that AO3 Enhancements does not currently sync data and options between browsers.
      This means that you have to configure all devices that you install it on.
    </p>
    <p>
      If you find a bug or have a feature request please file an issue at the <a href="https://github.com/jsmnbom/ao3-enhancements" target="_blank">github repository</a>.
      Or if you don't have a github account you can message me on twitter: <a href="https://twitter.com/jsmnbom" target="_blank">@jsmnbom</a>
    </p>
  </footer>
</template>

<style scoped>
footer {
  background: #900 url('../../img/red-ao3.png');
  box-shadow:
    inset 0 -6px 10px rgba(0, 0, 0, 0.35),
    1px 1px 3px -1px rgba(0, 0, 0, 0.25),
    inset 0 -1px 0 rgba(0, 0, 0, 0.85);
}
</style>
