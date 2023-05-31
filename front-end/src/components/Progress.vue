<script setup>
import { computed, toRefs, useSlots } from 'vue'

const props = defineProps(['total', 'partial', 'secondary'])
const { total, partial } = toRefs(props)

const slots = useSlots()

const progress_partial = computed(() => total.value ? partial.value * 100 / total.value : 0)
const progress_leftover = computed(() => total.value ? leftover.value * 100 / total.value : 0)
const leftover = computed(() => total.value ? total.value - progress_partial.value : 0)
</script>

<template>
  <div class="grid gap-2">
    <div class="w-full mx-auto bg-white h-4 rounded-full relative">
      <div class="absolute p-0.5 w-full h-full top-0 left-0">
        <div
          class="min-w-[30px] h-3 w-full bg-black/20 rounded-full animate-pulse transition-all duration-500"
          :style="{ width: `${secondary ?? 0}%` }"
        />
      </div>
      <div class="absolute p-0.5 w-full h-full top-0 left-0">
        <div
          class="min-w-[30px] h-3 w-full bg-black/70 rounded-full transition-all duration-500"
          :style="{ width: `${progress_partial}%` }"
        />
      </div>
    </div>
    <slot
      v-if="slots.default"
      v-bind="{ progress_partial, progress_leftover, leftover }"
    />
  </div>
</template>