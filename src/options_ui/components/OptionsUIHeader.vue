<script setup lang="ts">
import { onMounted } from 'vue'

import Icon from '~icons/ao3e/icon.vue'

import type { NavItem } from '../composables/useNav.js'
import { useNav } from '../composables/useNav.js'
import { useSize } from '../composables/useSize.js'

const headerSize = useSize('header')

const { nav } = useNav()

function onNavItemClick(item: NavItem) {
  const y = item.ref.getBoundingClientRect().top + window.scrollY - headerSize.height.value - 16
  window.scrollTo({ top: y, behavior: 'smooth' })
}

onMounted(() => {
  headerSize.set()
})
</script>

<template>
  <header pos="sticky top-0" flex="~ col">
    <h1 bg="white" text="ao3" h-13 flex="~ row items-center" px="2 sm:4">
      <Icon h-10 w-10 pr-2 />
      <span text="base sm:xl md:2xl">
        AO3 Enhancements
      </span>
      <sup text="sm md:base" font="italic" mb-2 ml-2px>
        options
      </sup>
    </h1>
    <div
      class="nav"
      min-h="8"
      flex="~ row items-center wrap gap-x-2 md:gap-x-5"
      pl="1 md:5"
    >
      <a
        v-for="item in nav"
        :key="item.name"
        href="#"

        class="decoration-none"
        :class="{ 'bg-opacity-20': item.active }"
        block
        min-h="8"
        px="1 md:2"
        border="b-none"
        flex="~ row items-center"
        un-text="sm white hover:#111"
        bg="#ddd opacity-0 hover:opacity-80"

        @click.prevent="onNavItemClick(item)"
      >
        <span>{{ item.name }}</span>
      </a>
    </div>
  </header>
</template>

<style scoped>
.nav {
  background: #900 url('../../img/red-ao3.png');
  box-shadow:
    inset 0 -6px 10px rgba(0, 0, 0, 0.35),
    1px 1px 3px -1px rgba(0, 0, 0, 0.25),
    inset 0 -1px 0 rgba(0, 0, 0, 0.85);
}
</style>
