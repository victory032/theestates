<script setup>
import { useEventBus } from "@vueuse/core";

import useUser from "@/composables/useUser";
import useBalanceStore from "@/stores/balance";
import sliceAddress from "@/utils/sliceAddress";
import useItemStore from "@/stores/item";
const balanceStore = useBalanceStore();
const { on: onAppEvent, emit: emitAppEvent } = useEventBus("app");
const { isAuthenticated, isAppNetwork, wallet, appBlockExplorer } = useUser();
const itemStore = useItemStore();

onAppEvent(({ type }) => {
  const events = {
    accountsChanged: () => balanceStore.loadBalance(),
    tokensChanged: () => balanceStore.loadBalance(),
  };

  events[type]?.() ?? null;
});

itemStore.loadItemsBucket();

const fetchBalance = () =>
  isAuthenticated.value && isAppNetwork.value
    ? balanceStore.loadBalance()
    : null;

fetchBalance();

wallet?.on("block", async (block) => {
  fetchBalance();
  emitAppEvent({ type: "block", payload: block });
});
</script>

<template>
  <div class="flex flex-col min-h-full backdrop-blur-sm flex-grow">
    <Navigation />
    <div class="flex items-center flex-grow">
      <RouterView />
    </div>
    <Footer />
    <NotificationGroup>
      <div
        class="fixed left-0 right-0 z-50 grid w-full max-w-sm mx-auto top-6 gap-y-2"
      >
        <Notification
          v-slot="{ notifications, close }"
          enter="transform transition"
          enter-from="translate-y-2 opacity-0"
          enter-to="translate-y-0 opacity-100"
          leave="transition ease-in"
          leave-from="translate-y-0 opacity-100"
          leave-to="translate-y-2 opacity-0"
          move="transition"
        >
          <NotificationCard
            v-for="notification in notifications"
            :key="notification.id"
            :notification="notification"
            @close="close(notification.id)"
          >
            <template v-if="notification.payload" #footer="{ payload }">
              <template v-if="payload.type === 'receipt'">
                <div>
                  Etherscan transaction:
                  <a
                    :href="`${appBlockExplorer}/tx/${payload.receipt.txHash}`"
                    target="_blank"
                    class="text-blue-500"
                    >{{ sliceAddress(payload.receipt.txHash) }}</a
                  >
                </div>
                <div>Gas cost: {{ payload.receipt.gasCost }} ETH</div>
                <div>Block number: {{ payload.receipt.blockNumber }}</div>
              </template>
            </template>
          </NotificationCard>
        </Notification>
      </div>
    </NotificationGroup>
  </div>
</template>
