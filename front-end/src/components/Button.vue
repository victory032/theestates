<script setup>
import { computed, useSlots } from 'vue'
import Spinner from '@/components/Spinner.vue'

const slots = useSlots()
const props = defineProps({
  color: {
    type: String,
    required: false,
    default: 'black'
  },
  size: {
    type: String,
    required: false,
    default: 'default'
  },
  fit: {
    type: Boolean,
    required: false,
    default: false
  },
  loading: {
    type: Boolean,
    required: false,
    default: false
  }
})

const buttonClass = computed(() => ({
  'button--black': props.color === 'black',
  'button--default': props.size === 'default',
  'button--small': props.size === 'small',
  'button--fit': props.fit,
}))
</script>

<template>
  <button class="button" :class="buttonClass">
    <Spinner
      v-if="loading"
      class="w-5 h-5 mr-3"
    />
    <slot/>
    <div
      v-if="slots.icon"
      class="ml-1"
    >
      <slot name="icon"/>
    </div>
  </button>
</template>
