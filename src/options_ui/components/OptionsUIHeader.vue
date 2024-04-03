<script setup lang="ts">
import Icon from '~icons/ao3e/icon.vue'

import { vLayoutVar } from '../directives/vLayoutVar.js'

const { nav } = useNav()
const refs = ref<HTMLElement[] | null>(null)
// const indicator = ref<{ width?: string, height?: string, transform?: string }>({})

// watch([nav, refs], () => {
//   const activeIndex = nav.value.findIndex(item => item.active)
//   if (activeIndex === -1 || !refs.value)
//     return

//   const active = refs.value[activeIndex]
//   indicator.value = {
//     width: `${active.offsetWidth}px`,
//     height: `${active.offsetHeight}px`,
//     transform: `translate(${active.offsetLeft}px, ${active.offsetTop}px)`,
//   }
// }, { deep: true, immediate: true })
</script>

<template>
  <header v-layout-var="{ height: '--header-height' }" pos="sticky top-0 z-50" flex="~ col">
    <h1 bg="default" text="primary" flex="~ row items-center" px="2 sm:4" h-13>
      <Icon aria-hidden="true" h-10 w-10 pr-2 />
      <span text="base sm:xl md:2xl" font="serif">
        AO3 Enhancements Options
      </span>
    </h1>
    <nav
      class="bg-ao3 nav-shadow"
      pl="1 md:5"
    >
      <div

        relative
      >
        <!-- <div bg="muted-fg op-50 hover:op0" pointer-events-none absolute z-51 transition-all :style="indicator" /> -->
        <div flex="~ row items-center wrap">
          <a
            v-for="item in nav"
            ref="refs"
            :key="item.name"
            :href="`#${item.id}`"
            :data-state="item.active ? 'active' : 'inactive'"
            class="button-focus-ring"
            min-h="7.5"
            px="2 md:4"
            flex="~ row items-center"
            un-text="sm primary-fg"
            bg="transparent op0 state-active:accent state-active:op50 hover:accent hover:op60"
            transition="colors duration-500 hover:duration-150"
            z-52 block cursor-pointer decoration-none
          >
            <div>
              <span>{{ item.name }}</span>
            </div>
          </a>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.nav-shadow {
  box-shadow:
    inset 0 -6px 10px rgba(0, 0, 0, 0.25),
    1px 1px 3px -1px rgba(0, 0, 0, 0.15),
    inset 0 -1px 0 rgba(0, 0, 0, 0.65);
}
</style>
