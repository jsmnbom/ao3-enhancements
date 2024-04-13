<script setup lang="ts" generic="T">
import type { Table } from '@tanstack/vue-table'

defineProps<{
  table: Table<T>
}>()
</script>

<template>
  <div class="flex items-center space-x-6 lg:space-x-8">
    <div class="flex w-[100px] items-center justify-center text-sm font-medium">
      Page {{ table.getState().pagination.pageIndex + 1 }} of
      {{ table.getPageCount() }}
    </div>
    <div class="flex items-center space-x-2">
      <Button
        variant="outline"
        class="h-8 w-8 p-0!"
        :disabled="!table.getCanPreviousPage()"
        aria-label="Go to first page"
        @click="table.setPageIndex(0)"
      >
        <icon-mdi-chevron-double-left class="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        class="h-8 w-8 p-0!"
        :disabled="!table.getCanPreviousPage()"
        aria-label="Go to previous page"
        @click="table.previousPage()"
      >
        <icon-mdi-chevron-left class="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        class="h-8 w-8 p-0!"
        :disabled="!table.getCanNextPage()"
        aria-label="Go to next page"
        @click="table.nextPage()"
      >
        <icon-mdi-chevron-right class="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        class="h-8 w-8 p-0!"
        :disabled="!table.getCanNextPage()"
        aria-label="Go to last page"
        @click="table.setPageIndex(table.getPageCount() - 1)"
      >
        <icon-mdi-chevron-double-right class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>
