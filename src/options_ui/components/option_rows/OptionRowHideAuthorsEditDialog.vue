<script setup lang="ts">
import type { ComponentInstance, GlobalComponents } from 'vue'

import type { AuthorFilter } from '#common'

const context = OptionRowHideAuthorsContext.inject()
const { filters } = useOption('hideAuthors')

const open = ref(false)

const Blank = {
  userId: '',
  pseud: '',
  invert: false,
}

const initial = ref<AuthorFilter>(Blank)
const userId = ref(Blank.userId)
const pseud = ref(Blank.pseud)
const invert = ref(Blank.invert)

const creating = computed(() => toRaw(initial.value) === Blank)

context.edit = (value?: AuthorFilter) => {
  open.value = true
  initial.value = value ?? toRaw(Blank)
  userId.value = initial.value.userId
  pseud.value = initial.value.pseud ?? ''
  invert.value = initial.value.invert ?? false
}

context.remove = (value: AuthorFilter) => {
  filters.value.splice(filters.value.indexOf(value), 1)
}

function setDialogRef(ref: unknown) {
  context.editDialog.value = ref as ComponentInstance<GlobalComponents['Dialog']>
}

function save() {
  if (creating.value) {
    filters.value.push({ userId: userId.value, pseud: pseud.value || undefined, invert: invert.value })
  }
  else {
    initial.value.userId = userId.value
    initial.value.pseud = pseud.value || undefined
    initial.value.invert = invert.value
  }
  open.value = false
}
</script>

<template>
  <Dialog :ref="setDialogRef" v-model:open="open" detached-trigger>
    <DialogContent>
      <DialogTitle>
        {{ creating ? 'Create' : 'Edit' }} author filter
      </DialogTitle>
      <div flex="~ col gap-4" pt-4>
        <label flex="~ col gap-1">
          <span text="sm muted-fg">User ID filter</span>
          <Input
            v-model="userId"
            type="text"
            text="base" h-10 w-full py-2 pl-2 pr-15
          />
        </label>
        <label flex="~ col gap-1">
          <span text="sm muted-fg">Pseud filter</span>
          <Input
            v-model="pseud"
            type="text"
            text="base" h-10 w-full py-2 pl-2 pr-15
          />
          <p text="xs muted-fg" pl-1>
            An author filter will by default match all that author's pseudonyms. If you want to restrict the filter to only match works by the author under a specific pseudonym, enter the pseudonym here.
          </p>
        </label>

        <label text="sm">
          <span>Invert filter (will unhide works that match)</span>
          <input v-model="invert" type="checkbox">
        </label>

        <div flex="~ gap-4 justify-end">
          <Button
            text="sm"
            variant="outline"
            @click="open = false"
          >
            Cancel
          </Button>
          <Button
            text="sm"
            variant="default"
            @click="save"
          >
            Save
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
