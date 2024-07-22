<script setup lang="ts">
import { vLayoutVar } from '../directives/vLayoutVar.ts'

const { nav } = useNav()
</script>

<template>
  <header v-layout-var="{ height: '--header-height' }" pos="sticky top-0 z-50" flex="~ col">
    <span bg="default" text="primary" flex="~ row items-center" px="2 sm:4" h-13>
      <Icon i-ao3e-icon h-10 w-10 pr-2 />
      <span text="lg sm:xl md:2xl" lh="4" font="serif">
        AO3 Enhancements Options
      </span>
    </span>
    <nav
      class="nav-shadow bg-ao3"
      pl="1 md:5"
    >
      <div flex="~ row items-center wrap">
        <a
          v-for="item in nav"
          :key="item.name"
          :href="`#${item.id}`"
          :data-state="item.active ? 'active' : 'inactive'"
          class="input-ring"
          min-h="7.5"
          px="2 md:4"
          flex="~ row items-center"
          un-text="sm primary-fg"
          bg="transparent op0 state-active:accent state-active:op50 hover:accent hover:op60"
          transition="colors duration-500 hover:duration-150"
          z-52 block cursor-pointer decoration-none
        >
          <span>{{ item.name }}</span>
        </a>
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
