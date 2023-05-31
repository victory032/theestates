<script setup>
import { ref, computed, reactive } from "vue";
import { useEventBus, useTimestamp } from "@vueuse/core";
import { notify } from "notiwind";

import { useUser, useEstatesContract, useStakingContract } from "@/composables";
import { timeleft, getGasCost } from "@/utils";

import IconX from "@/assets/icons/x.svg";
import IconLockOpen from "@/assets/icons/lock-open.svg";
import IconLockClosed from "@/assets/icons/lock-closed.svg";
import useBalanceStore from "@/stores/balance";

const timestamp = useTimestamp();
const balanceStore = useBalanceStore();
const { on: onAppEvent, emit: emitAppEvent } = useEventBus("app");

const { address } = useUser();

const inventory = reactive({
  loading: ref(false),
  tokens: ref([]),
  locktime: ref(null),
});

const availableTokens = computed(() =>
  inventory.tokens.filter(
    (token) =>
      !isTokenLocked(token) && !isTokenSelected(token) && isTokenLoaded(token)
  )
);

const { contract: estates, tokensOfOwner } = useEstatesContract(address);
const {
  contract: staking,
  viewStakes,
  LOCK_IN,
  generationBalance,
} = useStakingContract(address);

const isStakingLoading = ref(false);
const isUnstakingLoading = ref(false);

const selectedTokens = ref([]);

const isStakeEnabled = computed(
  () =>
    selectedTokens.value.length &&
    selectedTokens.value.length ===
      selectedTokens.value.filter((token) => token.status === "unstaked").length
);
const isUnstakeEnabled = computed(
  () =>
    selectedTokens.value.length &&
    selectedTokens.value.length ===
      selectedTokens.value.filter((token) => token.status === "staked").length
);

const isSelectAllEnabled = computed(() => availableTokens.value.length);
const isDeselectAllEnabled = computed(() => selectedTokens.value.length);

const addToken = (token) =>
  selectedTokens.value.push(JSON.parse(JSON.stringify(token)));
const removeToken = (token) =>
  selectedTokens.value.splice(
    selectedTokens.value.findIndex((t) => t.id === token.id),
    1
  );

const onTokenSelect = (token) =>
  selectedTokens.value.findIndex((t) => t.id === token.id) != -1
    ? removeToken(token)
    : addToken(token);

const selectAll = () =>
  (selectedTokens.value = JSON.parse(
    JSON.stringify(
      inventory.tokens.filter(
        (token) => !isTokenLocked(token) && isTokenLoaded(token)
      )
    )
  ));
const deselectAll = () => (selectedTokens.value = []);

const isTokenSelected = (token) =>
  selectedTokens.value.findIndex((t) => t.id === token.id) != -1;
const isTokenLocked = (token) =>
  Boolean(token.staked_at)
    ? token.staked_at + inventory.locktime > new Date().valueOf()
    : false;
const isTokenLoaded = (token) => token.staked_at >= 0;

const getReadableUnlockTime = (payload) =>
  Object.entries(timeleft(payload - timestamp.value))
    .map(([key, value]) => `${value}${key}`)
    .filter(([value]) => value > 0)
    .join(" ");

const onTokenLoad = (token) => {
  const index = inventory.tokens.findIndex((t) => t.id === token.id);
  inventory.tokens[index] = {
    ...inventory.tokens[index],
    ...token,
  };
};

const stakeSelectedTokens = async () => {
  try {
    isStakingLoading.value = true;
    const payload = selectedTokens.value.map(({ id }) => ({
      id,
      status: "staked",
    }));
    const payloadMapped = payload.map(({ id }) => id);

    const stakeMethod =
      payloadMapped.length > 1
        ? estates.groupStake(payloadMapped)
        : estates.Stake(payloadMapped[0]);
    const transaction = await stakeMethod;
    const receipt = await transaction.wait();

    emitAppEvent({ type: "tokensChanged", payload });

    notify({
      type: "success",
      title: "Staking",
      text:
        payloadMapped.length > 1
          ? `Estates ${payloadMapped.join(", ")} staked successfully`
          : `Estate ${payloadMapped[0]} staked successfully`,
      payload: {
        type: "receipt",
        receipt: {
          txHash: receipt.transactionHash,
          gasCost: getGasCost(receipt),
          blockNumber: receipt.blockNumber,
        },
      },
    });

    deselectAll();
  } catch (error) {
    notify({
      type: "error",
      title: "Staking",
      text: error.reason ?? error.message,
    });
  } finally {
    isStakingLoading.value = false;
  }
};

const unstakeSelectedTokens = async () => {
  try {
    isUnstakingLoading.value = true;
    const payload = selectedTokens.value.map(({ id }) => ({
      id,
      status: "unstaked",
    }));
    const payloadMapped = payload.map(({ id }) => id);

    const unstakeMethod =
      payloadMapped.length > 1
        ? staking.groupUnstake(payloadMapped)
        : staking.singleUnstake(payloadMapped[0]);
    const transaction = await unstakeMethod;
    const receipt = await transaction.wait();

    emitAppEvent({ type: "tokensChanged", payload });

    notify({
      type: "success",
      title: "Staking",
      text:
        payloadMapped.length > 1
          ? `Estates ${payloadMapped.join(", ")} unstaked successfully`
          : `Estate ${payloadMapped[0]} unstaked successfully`,
      payload: {
        type: "receipt",
        receipt: {
          txHash: receipt.transactionHash,
          gasCost: getGasCost(receipt),
          blockNumber: receipt.blockNumber,
        },
      },
    });

    deselectAll();
  } catch (error) {
    notify({
      type: "error",
      title: "Staking",
      text: error.reason ?? error.message,
    });
  } finally {
    isUnstakingLoading.value = false;
  }
};

const getTokens = async () => {
  try {
    const [unstaked, staked] = await Promise.all([
      tokensOfOwner(),
      viewStakes(),
    ]);

    const result = [
      ...unstaked.map((item) => ({ id: item.toNumber(), status: "unstaked" })),
      ...staked.map((item) => ({ id: item.toNumber(), status: "staked" })),
    ];

    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(error);
  }
};

const loadInventory = async () => {
  try {
    inventory.loading = true;
    inventory.locktime = await LOCK_IN();
    inventory.tokens = await getTokens();
    return Promise.resolve(inventory);
  } catch (error) {
    return Promise.reject(error);
  } finally {
    inventory.loading = false;
  }
};

onAppEvent(({ type }) => {
  const events = {
    accountsChanged: () => loadInventory(),
  };

  events[type]?.() ?? null;
});

loadInventory();
</script>

<template>
  <div class="self-start w-full py-16">
    <div class="container max-w-screen-2xl">
      <div class="grid items-start h-full gap-16 lg:flex">
        <div class="w-full">
          <div class="grid gap-12">
            <div class="grid gap-6">
              <div class="flex items-center justify-between">
                <div class="font-serif text-2xl font-bold">Inventory</div>
                <Transition name="fade">
                  <div
                    v-if="inventory.locktime !== null"
                    class="flex items-start gap-1 text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 shadow-sm"
                  >
                    <div class="shrink-0">
                      <component
                        :is="
                          inventory.locktime > 0 ? IconLockClosed : IconLockOpen
                        "
                        class="w-4 h-4"
                      />
                    </div>
                    Staking lock duration:
                    <span class="font-semibold">{{
                      inventory.locktime > 0
                        ? Object.entries(timeleft(inventory.locktime))
                            .map(([key, value]) => `${value}${key}`)
                            .filter(([value]) => value > 0)
                            .join(" ")
                        : "None"
                    }}</span>
                  </div>
                </Transition>
              </div>
              <div class="flex items-center w-full text-xs">
                <div class="flex items-center flex-1 gap-4">
                  <div>Selected Estates:</div>
                  <div class="font-semibold">
                    <template v-if="selectedTokens.length">
                      <div class="flex flex-wrap items-center gap-1">
                        <div
                          v-for="token in selectedTokens"
                          :key="token.id"
                          class="inline-flex items-center justify-center h-8 gap-1 pl-3 pr-2 text-xs font-semibold leading-none bg-black rounded-xl"
                        >
                          <div>#{{ token.id }}</div>
                          <button
                            class="transition text-white/40 hover:text-white/50 active:text-white"
                            @click="removeToken(token)"
                          >
                            <IconX class="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </template>
                    <template v-else> None </template>
                  </div>
                </div>
                <div class="flex items-end justify-end flex-1 gap-2">
                  <Button
                    size="small"
                    @click="selectAll"
                    :disabled="!isSelectAllEnabled"
                    >Select all</Button
                  >
                  <Button
                    size="small"
                    @click="deselectAll"
                    :disabled="!isDeselectAllEnabled"
                    >Deselect all</Button
                  >
                  <Button
                    size="small"
                    :disabled="
                      isUnstakeEnabled || !isStakeEnabled || isStakingLoading
                    "
                    :loading="isStakingLoading"
                    @click="stakeSelectedTokens"
                  >
                    Stake
                  </Button>
                  <Button
                    size="small"
                    :disabled="
                      isStakeEnabled || !isUnstakeEnabled || isUnstakingLoading
                    "
                    :loading="isUnstakingLoading"
                    @click="unstakeSelectedTokens"
                  >
                    Unstake
                  </Button>
                </div>
              </div>
            </div>
            <template v-if="inventory.loading">
              <div class="flex items-center justify-center gap-2">
                <Spinner class="w-5 h-5" />
                <div class="text-center">Requesting owned tokens...</div>
              </div>
            </template>
            <template v-else-if="inventory.tokens.length">
              <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <EstateCard
                  v-for="token in inventory.tokens"
                  :id="token.id"
                  as="button"
                  :active="isTokenSelected(token)"
                  :locked="isTokenLocked(token)"
                  :disabled="isTokenLocked(token)"
                  @click="onTokenSelect(token)"
                  @load="onTokenLoad"
                >
                  <template v-if="token.status === 'staked'" #label>
                    <span
                      class="inline-flex items-center justify-center h-6 gap-1 px-3 text-xs font-semibold leading-none bg-black rounded-xl"
                    >
                      <span class="capitalize">{{ token.status }}</span>
                    </span>
                  </template>

                  <template v-if="isTokenLocked(token)" #description>
                    <div class="flex items-start gap-1 text-xs">
                      <div class="shrink-0">
                        <IconLockClosed class="w-4 h-4" />
                      </div>
                      Unlocks in
                      {{
                        getReadableUnlockTime(
                          token.staked_at + inventory.locktime
                        )
                      }}
                    </div>
                  </template>
                </EstateCard>
              </div>
            </template>
            <template v-else>
              <div class="text-center">No owned tokens found</div>
            </template>
          </div>
        </div>
        <div class="w-full lg:max-w-[320px] sticky top-32">
          <div class="grid gap-6">
            <Stake />
            <Rewards />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
