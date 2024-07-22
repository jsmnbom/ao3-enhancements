<script setup lang="ts">
import { vLayoutVar } from '../directives/vLayoutVar.ts'
</script>

<template>
  <footer v-layout-var="{ height: '--footer-height' }" class="bg-ao3" flex="~ col gap2" px-4 py-12 text="primary-fg sm">
    <p>
      Please note that AO3 Enhancements does not currently sync data and options between browsers.
      This means that you have to configure all devices that you install it on.
    </p>
    <p>
      If you find a bug or have a feature request please file an issue at the <a class="link" href="https://github.com/jsmnbom/ao3-enhancements" target="_blank">github repository</a>.
      Or if you don't have a github account you can message me on twitter: <a class="link" href="https://twitter.com/jsmnbom" target="_blank">@jsmnbom</a>
    </p>
  </footer>
</template>
