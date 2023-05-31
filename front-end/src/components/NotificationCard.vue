<script setup>
import { computed, useSlots } from 'vue'
import IconCheckCircle from '@/assets/icons/check-circle.svg'
import IconInformationCircle from '@/assets/icons/information-circle.svg'
import IconExclamationCircle from '@/assets/icons/exclamation-circle.svg'
import IconExclamation from '@/assets/icons/exclamation.svg'
import IconX from '@/assets/icons/x.svg'

const props = defineProps(['notification'])
const { notification } = props

const emit = defineEmits(['close'])
const slots = useSlots()

const isSuccess = computed(() => notification.type === 'success')
const isInfo = computed(() => notification.type === 'info')
const isError = computed(() => notification.type === 'error')
const isWarning = computed(() => notification.type === 'warning')

const close = () => {
  emit('close', notification.id)
}
</script>

<template>
  <div class="relative flex items-start gap-2 p-4 rounded backdrop-blur border-white/10 bg-gradient-to-tr from-white/70 via-white to-white/90">
    <IconCheckCircle v-if="isSuccess" class="w-5 h-5 text-green-500 shrink-0" />
    <IconInformationCircle v-if="isInfo" class="w-5 h-5 text-blue-500 shrink-0" />
    <IconExclamationCircle v-if="isError" class="w-5 h-5 text-red-500 shrink-0" />
    <IconExclamation v-if="isWarning" class="w-5 h-5 text-orange-500 shrink-0" />
    <div class="text-sm">
      <div class="font-semibold text-black">{{ notification.title }}</div>
      <div class="leading-tight text-gray-500 capitalize-first">{{ notification.text }}</div>
      <div v-if="slots.footer" class="text-[10px] italic leading-tight text-gray-500 mt-2">
        <slot
          name="footer"
          v-bind="{ payload: notification.payload }"
        />
      </div>
    </div>
    <button @click="close" class="absolute inline-flex transition top-3 right-3 text-zinc-300 hover:text-zinc-400 active:text-zinc-500 focus:text-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">
      <IconX class="w-4 h-4" />
    </button>
  </div>
</template>

<style scoped>
.capitalize-first::first-letter {
  text-transform: uppercase;
}
</style>