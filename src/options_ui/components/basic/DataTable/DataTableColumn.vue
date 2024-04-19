<script setup lang="ts">
import type { DataTableColumnBaseProps } from './types.ts'

interface Props extends DataTableColumnBaseProps<object, any> {
  accessorKey?: string
  accessorFn?: (row: any) => any
  id?: string
}

const props = defineProps<Props>()
const slots = defineSlots()

defineExpose({ props, slots })
</script>
