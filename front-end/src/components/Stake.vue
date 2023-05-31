<script setup>
import { reactive } from 'vue'
import { useAsyncState, useEventBus } from '@vueuse/core'
import { useEstatesContract, useStakingContract } from '@/composables'

const { on: onAppEvent } = useEventBus('app')

const stats = reactive({
  totalSupply: 0,
  stakedSupply: 0
})

const { totalSupply: getTotalSupply } = useEstatesContract()
const { balanceOf: getBalanceOf } = useStakingContract()

const getStake = async () => {
  const [totalSupply, stakedSupply] = await Promise.all([
    getTotalSupply(),
    getBalanceOf(import.meta.env.VITE_CONTRACT_STAKING)
  ])

  return {
    totalSupply,
    stakedSupply
  }
}

const { state, isLoading, execute } = useAsyncState(() => getStake(), stats, { resetOnExecute: false })

onAppEvent(({ type, payload }) => {
  const events = {
    'block': () => execute()
  }

  events[type]?.() ?? null
})
</script>

<template>
  <div class="grid gap-4 p-8 text-sm border shadow-sm border-white/10 bg-gradient-to-bl from-white/20 rounded-2xl">
    <div class="font-serif text-xl font-bold">Staking stats</div>
    <div class="relative p-2 -m-2">
      <Progress
        :total="state.totalSupply"
        :partial="state.stakedSupply"
        #="{ progress_partial, progress_leftover, leftover }"
      >
        <div class="flex items-center text-xs">
          Staked supply
          <div class="ml-auto font-semibold">
            {{ state.stakedSupply.toLocaleString() }} of {{ state.totalSupply.toLocaleString() }} ({{ progress_partial.toFixed(2) }}%)
          </div>
        </div>
      </Progress>
      <Transition name="fade" duration="200">
        <LoadingOverlay v-if="isLoading" />
      </Transition>
    </div>
  </div>
</template>