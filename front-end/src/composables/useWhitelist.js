import { computed } from 'vue'
import { useFetch } from '@vueuse/core'

export default (address) => {
  const {
    data,
    error: whitelistError,
    isFetching: isWhitelistLoading,
    isFinished: isWhitelistReady,
    execute: loadWhitelist
  } = useFetch(import.meta.env.VITE_WHITELIST_URL).get().json()

  const whitelist = computed(() => data.value?.[address.value] ?? null)

  const isWhitelisted = computed(() => Boolean(whitelist.value))

  return {
    whitelist,
    isWhitelisted,
    whitelistError,
    isWhitelistLoading,
    isWhitelistReady,
    loadWhitelist
  }
}