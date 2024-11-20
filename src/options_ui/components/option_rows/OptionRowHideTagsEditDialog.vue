<script setup lang="ts">
import type { TagFilter } from '#common'

import { TagType } from '#common'

const context = OptionRowHideTagsContext.inject()
const { filters } = useOption('hideTags')

const open = ref(false)

const MatcherTypes = [
  ['contains', 'Contains', 'Matches if the tag contains the filter. Often used for matching one person in a Relationship tag.', 'i-codicon-whole-word'],
  ['regex', 'Regex', 'Uses regular expressions to match the filter to the tag.', 'i-codicon-regex'],
] as const

const Blank: TagFilter = {
  name: '',
  type: undefined,
  invert: false,
  matcher: 'exact',
}

const initial = ref(Blank)
const name = ref(Blank.name)
const type = ref(Blank.type)
const invert = ref(Blank.invert)
const matcher = ref(Blank.matcher)

const creating = computed(() => toRaw(initial.value) === Blank)

context.edit = (value?: TagFilter) => {
  open.value = true
  initial.value = value ?? toRaw(Blank)
  name.value = initial.value.name
  type.value = initial.value.type
  invert.value = initial.value.invert
  matcher.value = initial.value.matcher
}

context.remove = (value: TagFilter) => {
  filters.value.splice(filters.value.indexOf(value), 1)
}

function setDialogRef(ref: unknown) {
  context.editDialog.value = ref as ComponentInstance['Dialog']
}

function save() {
  if (creating.value) {
    filters.value.push({ name: name.value, type: type.value, invert: invert.value, matcher: matcher.value })
  }
  else {
    initial.value.name = name.value
    initial.value.type = type.value
    initial.value.invert = invert.value
    initial.value.matcher = matcher.value
  }
  open.value = false
}

const typeModel = computed({
  get: () => type.value ?? 'undefined',
  set: (v?: string) => type.value = v === 'undefined' ? undefined : v as TagType,
})
</script>

<template>
  <Dialog :ref="setDialogRef" v-model:open="open" detached-trigger>
    <DialogContent>
      <DialogTitle>
        {{ creating ? 'Create' : 'Edit' }} tag filter
      </DialogTitle>
      <div flex="~ col gap-4" pt-4>
        <label flex="~ col gap-1">
          <span text="sm muted-fg">Name filter</span>
          <Input
            v-model="name"
            type="text"
            text="base" h-10 w-full py-2 pl-2 pr-15
          >
            <div absolute inset-y-0 right-2 flex="inline items-center">
              <RadixToggle
                v-for="[value, label, tooltip, icon] in MatcherTypes"
                :key="value"
                :pressed="matcher === value"
                flex="~ items-center justify-center"
                h-6
                w-6 cursor-pointer
                rounded-md
                border="1 transparent state-on:(primary)"
                bg="hover:input state-on:(primary! op30!)"
                @update:pressed="(v) => matcher = v ? value : 'exact'"
              >
                <Tooltip>
                  <div>
                    <Icon v-bind="{ [icon]: '' }" :label="label" />
                  </div>
                  <template #content>
                    <span>{{ tooltip }}</span>
                  </template>
                </Tooltip>
              </RadixToggle>
            </div>
          </Input>
        </label>
        <label flex="~ col gap-1">
          <span text="sm muted-fg">Restrict to type</span>
          <Select v-model="typeModel" text="sm">
            <SelectItem value="undefined">
              <span text="muted-fg">Any type (do not restrict)</span>
            </SelectItem>
            <SelectItem v-for="t in TagType.values()" :key="t" :value="t">
              {{ TagType.toDisplayString(t) }}
            </SelectItem>
          </Select>
          <p text="xs muted-fg" pl-1>
            See <ArchiveLink path="/faq/tags#tagtypes">this link</ArchiveLink> for explanation of different tag types.
            It is okay to set as "Any type" if you're unsure what type your tag is.
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
