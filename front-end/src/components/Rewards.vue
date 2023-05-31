<script setup>
import { ref, computed } from 'vue'
import { useEventBus } from '@vueuse/core'
import { notify } from 'notiwind'

import useStakingContract from '@/composables/useStakingContract'
import useUser from '@/composables/useUser'
import useBalanceStore from '@/stores/balance'
import { getGasCost } from '@/utils'

const { address, wallet } = useUser()
const balanceStore = useBalanceStore()
const { withdrawEquity, BASE_RATE, generationBalance } = useStakingContract(address)

const { on: onAppEvent } = useEventBus('app')

const isWithdrawLoading = ref(false)
const isYieldLoading = ref(false)

const genbalance = ref(null)
const baserate = ref(0)
const block = ref(null)

const dayrate = computed(() => (genbalance.value?.[1] + (genbalance.value?.[2]*12/5) + (genbalance.value?.[3]*6) + (genbalance.value?.[4]*78/5)) || 0)
const dailyyield = computed(() => baserate.value * dayrate.value)

const loadYield = async () => {
  try {
    isYieldLoading.value = true
    const [a, b] = await Promise.all([
      BASE_RATE(),
      generationBalance()
    ])

    baserate.value = a
    genbalance.value = b
  } catch (error) {
    notify({
      type: 'error',
      title: 'Rewards',
      text: error.reason ?? error.message
    })
  } finally {
    isYieldLoading.value = false
  }
}

const withdraw = async () => {
  try {
    isWithdrawLoading.value = true
    const transaction = await withdrawEquity()
    const receipt = await transaction.wait()
    balanceStore.loadBalance()
    notify({
      type: 'success',
      title: 'Rewards',
      text: `Accumulated $EQY successfully claimed`,
      payload: {
        type: 'receipt',
        receipt: {
          txHash: receipt.transactionHash,
          gasCost: getGasCost(receipt),
          blockNumber: receipt.blockNumber
        }
      }
    })
  } catch (error) {
    notify({
      type: 'error',
      title: 'Rewards',
      text: error.reason ?? error.message
    })
  } finally {
    isWithdrawLoading.value = false
  }
}

loadYield()

block.value = await wallet.getBlockNumber()

onAppEvent(({ type, payload }) => {
  const events = {
    'tokensChanged': () => loadYield(),
    'block': () => {
      block.value = payload
    }
  }

  events[type]?.() ?? null
})
</script>

<template>
  <div class="grid gap-4 p-8 text-sm border shadow-sm border-white/10 bg-gradient-to-bl from-white/20 rounded-2xl">
    <div class="font-serif text-xl font-bold">Claim $EQUITY</div>
    <div class="relative px-8 -mx-8">
      <div class="flex items-center gap-4 py-2 border-t first:border-t-0 border-t-white/10">
        <div class="items-start flex-1 text-sm">Current balance</div>
        <div class="items-end flex-1 font-semibold text-right">{{ balanceStore.balance.toFixed(2) }} {{ balanceStore.symbol }}</div>
      </div>
      <div class="flex items-center gap-4 py-2 border-t first:border-t-0 border-t-white/10">
        <div class="items-start flex-1 text-sm">Unclaimed rewards</div>
        <div class="items-end flex-1 font-semibold text-right">{{ balanceStore.rewards.toFixed(2) }} {{ balanceStore.symbol }}</div>
      </div>
      <div class="flex items-center gap-4 py-2 border-t first:border-t-0 border-t-white/10">
        <div class="items-start flex-1 text-sm">Daily yield</div>
        <div class="items-end flex-1 font-semibold text-right">{{ dailyyield }} {{ balanceStore.symbol }}</div>
      </div>
      <div class="flex items-center gap-4 py-2 border-t first:border-t-0 border-t-white/10">
        <div class="items-start flex-1 text-sm">Current block</div>
        <div class="items-end flex-1 font-semibold text-right">{{ block }}</div>
      </div>
      <Transition name="fade" duration="200">
        <LoadingOverlay v-if="balanceStore.isBalanceLoading || isYieldLoading" />
      </Transition>
    </div>
    <div class="mt-2">
      <Button
        :disabled="balanceStore.isBalanceLoading || !balanceStore.rewards || isWithdrawLoading"
        :loading="isWithdrawLoading"
        fit
        @click="withdraw"
      >
        Claim accumulated $EQY  
      </Button>
    </div>
  </div>
</template>