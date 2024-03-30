<script setup lang="ts">
import Icon from '~icons/ao3e/icon.vue'

import { useNav } from '../composables/useNav.js'
import { vLayoutVar } from '../directives/vLayoutVar.js'

const { nav } = useNav()
</script>

<template>
  <header v-layout-var="{ height: '--header-height' }" pos="sticky top-0 z-1000" flex="~ col">
    <h1 bg="card" text="primary" h-13 flex="~ row items-center" px="2 sm:4">
      <Icon aria-hidden="true" h-10 w-10 pr-2 />
      <span text="base sm:xl md:2xl">
        AO3 Enhancements
      </span>
      <sup text="sm md:base" font="italic" mb-2 ml-2px>
        options
      </sup>
    </h1>
    <nav
      bg="primary [url(../img/red-ao3.png)]"
      min-h="8"
      flex="~ row items-center wrap gap-x-2 md:gap-x-5"
      pl="1 md:5"
    >
      <a
        v-for="item in nav"
        :key="item.name"
        :href="`#${item.id}`"
        :data-state="item.active ? 'active' : 'inactive'"
        block cursor-pointer border-none decoration-none
        min-h="8"
        px="1 md:2"
        flex="~ row items-center"
        un-text="sm primary-foreground"
        bg="muted-foreground op0 state=active:op80 hover:op60"
      >
        <span>{{ item.name }}</span>
      </a>
    </nav>
  </header>
</template>
