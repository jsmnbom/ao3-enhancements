<script lang="ts" setup>
import { categories } from './categories/index.js'
import { vLayoutVar } from './directives/vLayoutVar.js'

const refs = ref<ComponentPublicInstance[] | null>(null)

onMounted(() => {
  const last = refs.value![refs.value!.length - 1]
  const { height } = useElementSize(last.$el as HTMLElement, undefined, { box: 'border-box' })
  watch(height, () => last.$el.style.marginBottom = `calc(max(2rem, 100vh - ${height.value}px - var(--header-height) - var(--footer-height)))`)
})
</script>

<template>
  <RadixTooltipProvider :delay-duration="300">
    <Sonner />
    <div id="outer" color="foreground" bg="#eee">
      <OptionsUIHeader />
      <main id="inner">
        <form action="#" flex="~ col gap-5" mx-auto mt-8 container>
          <component
            :is="category"
            v-for="category, i in categories"
            ref="refs"
            :key="i"
          />
        </form>
      </main>
      <footer v-layout-var="{ height: '--footer-height' }" class="bg-ao3" flex="~ col gap2" px-4 py-12 text="primary-foreground sm">
        <p>
          Please note that AO3 Enhancements does not currently sync data and options between browsers.
          This means that you have to configure all devices that you install it on.
        </p>
        <p>
          If you find a bug or have a feature request please file an issue at the <a href="https://github.com/jsmnbom/ao3-enhancements" target="_blank">github repository</a>.
          Or if you don't have a github account you can message me on twitter: <a href="https://twitter.com/jsmnbom" target="_blank">@jsmnbom</a>
        </p>
      </footer>
    </div>
  </RadixTooltipProvider>
</template>

<style>
html {
  overflow-y: auto !important;
  scroll-behavior: smooth;
  scroll-padding-top: calc(var(--header-height) + 1rem);

  font-size: 16px;
  font-family: 'Lucida Grande', 'Lucida Sans Unicode', 'GNU Unifont', Verdana,
    Helvetica, sans-serif;
}
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

#outer {
  background-image: url(../img/options-background.svg);
}

.bg-ao3 {
  background-color: rgb(var(--color-primary));
  background-image: url(../img/red-ao3.png);
}
</style>
