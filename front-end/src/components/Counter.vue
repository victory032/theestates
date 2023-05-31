<script setup>
import { toRefs, computed } from 'vue'
import { useCounter } from '@vueuse/core'
const props = defineProps(['min', 'max'])
const { min, max } = toRefs(props)
const emit = defineEmits(['change'])

const { count, inc, dec } = useCounter(1, {
  min: min.value,
  max: max.value
})

const increment = (value = 1) => {
  inc(value)
  emit('change', count.value)
}

const decrement = (value = 1) => {
  dec(value)
  emit('change', count.value)
}

const isIncrementDisabled = computed(() => count.value === max.value)
const isDecrementDisabled = computed(() => count.value === min.value)
</script>

<template>
  <slot v-bind="{
    count,
    increment,
    decrement,
    isIncrementDisabled,
    isDecrementDisabled
  }" />
</template>