<script setup>
import { ref, computed } from "vue";
import { useAsyncState, useEventBus } from "@vueuse/core";
import { useRouter } from "vue-router";
import { notify } from "notiwind";

import {
  useUser,
  useEstatesContract,
  useStakingContract,
  useWhitelist,
} from "@/composables";
import { getDecimals, getGasCost } from "@/utils";

import IconPlus from "@/assets/icons/plus.svg";
import IconMinus from "@/assets/icons/minus.svg";

const router = useRouter();
const { on: onAppEvent } = useEventBus("app");

const { address, isAuthenticated, isAuthenticating, login } = useUser();
const { isWhitelisted, whitelist, isWhitelistLoading, isWhitelistReady } =
  useWhitelist(address);
const {
  maxBatch,
  maxGenesis,
  totalSupply,
  mintingPhase,
  PublicPrice,
  publicSaleKey,
  publicSaleActive,
  WLPrice,
  WLSaleActive,
  maxPerWL,
  maxPerPSL,
  maxPerAddress,
  WLMintsOnAddress,
  publicMintsOnAddress,
  mintWhitelist,
  mintPublic,
} = useEstatesContract(address);
const { balanceOf } = useStakingContract(address);

const loadMintingState = async () => {
  try {
    const [
      batch,
      genesis,
      supply,
      phase,
      pubPrice,
      whitePrice,
      pubActive,
      wlActive,
      pubKey,
      maxOG,
      maxPSL,
      maxAddress,
    ] = await Promise.all([
      maxBatch(),
      maxGenesis(),
      totalSupply(),
      mintingPhase(),
      PublicPrice(),
      WLPrice(),
      publicSaleActive(),
      WLSaleActive(),
      publicSaleKey(),
      maxPerWL(),
      maxPerPSL(),
      maxPerAddress(),
    ]);
    const userState = await loadUserMintingState(phase);

    return Promise.resolve({
      maxBatch: batch,
      maxGenesis: genesis,
      totalSupply: supply,
      mintingPhase: phase,
      publicPrice: pubPrice,
      WLPrice: whitePrice,
      publicSaleActive: pubActive,
      publicSaleKey: pubKey,
      WLSaleActive: wlActive,
      maxPerWL: maxOG,
      maxPerPSL: maxPSL,
      maxPerAddress: maxAddress,
      ...userState,
    });
  } catch (error) {
    notify({
      type: "error",
      title: "Minting",
      text: error.reason ?? error.message,
    });
  }
};

const loadUserMintingState = async (phase) => {
  try {
    if (!isAuthenticated.value)
      return Promise.resolve({ userWLMints: 0, userPublicMints: 0 });

    const [userWLMints, userPublicMints, estateBalance] = await Promise.all([
      WLMintsOnAddress(phase),
      publicMintsOnAddress(phase),
      balanceOf(),
    ]);

    return Promise.resolve({ userWLMints, userPublicMints, estateBalance });
  } catch (error) {
    notify({
      type: "error",
      title: "Minting",
      text: error.reason ?? error.message,
    });
  }
};

const {
  state,
  isLoading: isStateLoading,
  isReady: isStateReady,
  execute: loadState,
} = useAsyncState(() => loadMintingState(), {});

const isSoldOut = computed(() =>
  state.value.totalSupply
    ? state.value.totalSupply === state.value.maxGenesis
    : false
);

const mintToStake = ref(false);
const mintStateString = computed(() => {
  const result = [];
  if (state.value.WLSaleActive) result.push("Whitelist");
  if (state.value.publicSaleActive) result.push("Public");
  return isStateLoading.value
    ? "Loading minting state"
    : isSoldOut.value
    ? "Sold Out"
    : result.length
    ? `${result.join(" & ")} Mint is Live (Phase ${state.value.mintingPhase})`
    : "Mint not started";
});

const isPublicMintPending = ref(false);
const isWhitelistMintPending = ref(false);

const publicMint = async (vol, mintToStake, publicSaleKey, ether) => {
  try {
    isPublicMintPending.value = true;
    const tx = await mintPublic(vol, mintToStake, publicSaleKey, ether);
    const receipt = await tx.wait();

    notify({
      type: "success",
      title: "Minting",
      text: `${vol} ${vol > 1 ? "Estates" : "Estate"} minted successfully`,
      payload: {
        type: "receipt",
        receipt: {
          txHash: receipt.transactionHash,
          gasCost: getGasCost(receipt),
          blockNumber: receipt.blockNumber,
        },
      },
    });
    loadState();
    return Promise.resolve(receipt);
  } catch (error) {
    notify({
      type: "error",
      title: "Minting",
      text: error.reason ?? error.message,
    });
  } finally {
    isPublicMintPending.value = false;
  }
};

const whitelistMint = async (vol, opt, mintToStake, signature, ether) => {
  try {
    isWhitelistMintPending.value = true;
    const tx = await mintWhitelist(vol, opt, mintToStake, signature, ether);
    const receipt = await tx.wait();

    notify({
      type: "success",
      title: "Minting",
      text: `${vol} ${vol > 1 ? "Estates" : "Estate"} minted successfully`,
      payload: {
        type: "receipt",
        receipt: {
          txHash: receipt.transactionHash,
          gasCost: getGasCost(receipt),
          blockNumber: receipt.blockNumber,
        },
      },
    });
    loadState();
    return Promise.resolve(receipt);
  } catch (error) {
    notify({
      type: "error",
      title: "Minting",
      text: error.reason ?? error.message,
    });
  } finally {
    isWhitelistMintPending.value = false;
  }
};

const maxPerWhitelist = computed(() =>
  whitelist.value?.option === 0 ? state.value.maxPerWL : state.value.maxPerPSL
);

const whitelistRemaining = computed(() => {
  if (!isStateReady.value || !isWhitelisted.value) return 0;
  const remaining = maxPerWhitelist.value - state.value.userWLMints;
  return remaining >= 0 ? remaining : 0;
});
const publicRemaining = computed(() => {
  if (!isStateReady.value) return 0;
  const remaining =
    state.value.maxPerAddress -
    (state.value.userPublicMints + state.value.userWLMints);
  return remaining >= 0 ? remaining : 0;
});

const minCount = 1;
const maxCount = computed(() =>
  state.value.publicSaleActive
    ? Math.max(whitelistRemaining.value, publicRemaining.value)
    : whitelistRemaining.value
);
const count = ref(1);

const whitelistCount = computed(() =>
  count.value <= whitelistRemaining.value
    ? count.value
    : whitelistRemaining.value
);
const publicCount = computed(() =>
  count.value <= publicRemaining.value ? count.value : publicRemaining.value
);

const totalPublicPrice = computed(() =>
  (publicCount.value * state.value.publicPrice).toFixed(
    getDecimals(state.value.publicPrice)
  )
);
const totalWhitelistPrice = computed(() =>
  (whitelistCount.value * state.value.WLPrice).toFixed(
    getDecimals(state.value.WLPrice)
  )
);

const activeSupply = computed(
  () => state.value.mintingPhase * state.value.maxBatch || 0
);
const phaseMinted = computed(
  () =>
    state.value.maxBatch - (activeSupply.value - state.value.totalSupply) || 0
);
const phaseProgress = computed(() =>
  state.value.totalSupply
    ? Number(((phaseMinted.value * 100) / state.value.maxBatch).toFixed(2))
    : 0
);

const onCountChange = (newVal) => {
  count.value = newVal;
};

onAppEvent(({ type }) => {
  const events = {
    accountsChanged: () => loadState(),
  };

  events[type]?.() ?? null;
});
</script>

<template>
  <div class="self-center w-full py-12">
    <div class="container mx-auto">
      <div class="flex items-center gap-16 justify-center flex-col lg:flex-row">
        <div class="flex-1 max-w-[380px] md:max-w-[480px]">
          <img src="@/assets/estate.png" class="w-full h-auto" loading="lazy" />
        </div>
        <div class="grid flex-1 max-w-screen-sm gap-12">
          <div class="grid gap-6">
            <div>
              <div
                class="inline-flex items-center w-auto h-6 px-3 text-xs text-white bg-neutral-700 rounded-2xl"
              >
                {{ mintStateString }}
              </div>
            </div>
            <h1 class="font-serif text-5xl font-bold">The Estates</h1>
            <p class="text-sm">
              The Estates are a collection of architecturally designed,
              interoperable, next-gen metaverse-compatible boutique house NFTs,
              where every NFT has an accompanying 3D file with full
              interoperability across all metaverses, virtual, and augmented
              reality environments.
            </p>
          </div>

          <div class="relative p-2 -m-2">
            <Transition name="fade" duration="200">
              <LoadingOverlay v-if="isStateLoading" />
            </Transition>
            <div class="grid grid-cols-3 gap-2">
              <div
                class="px-6 py-4 shadow-sm bg-gradient-to-tr from-white/20 rounded-2xl"
              >
                <div class="font-serif">{{ isWhitelisted ? "Yes" : "No" }}</div>
                <div class="text-xs">Eligibible for Pre-Sale Mint</div>
              </div>

              <div
                class="px-6 py-4 shadow-sm bg-gradient-to-tr from-white/20 rounded-2xl"
              >
                <div class="font-serif">{{ state.WLPrice ?? 0 }} ETH</div>
                <div class="text-xs">Pre-Sale Mint price</div>
              </div>

              <div
                class="px-6 py-4 shadow-sm bg-gradient-to-tr from-white/20 rounded-2xl"
              >
                <div class="font-serif">{{ state.publicPrice ?? 0 }} ETH</div>
                <div class="text-xs">Public Mint Price</div>
              </div>

              <div
                class="px-6 py-4 shadow-sm bg-gradient-to-tr from-white/20 rounded-2xl"
              >
                <div class="font-serif">{{ state.maxPerWL ?? 0 }}</div>
                <div class="text-xs">Mints per OG Pre-Sale List</div>
              </div>

              <div
                class="px-6 py-4 shadow-sm bg-gradient-to-tr from-white/20 rounded-2xl"
              >
                <div class="font-serif">{{ state.maxPerPSL ?? 0 }}</div>
                <div class="text-xs">Mints per Pre-Sale list</div>
              </div>

              <div
                class="px-6 py-4 shadow-sm bg-gradient-to-tr from-white/20 rounded-2xl"
              >
                <div class="font-serif">{{ state.maxPerAddress ?? 0 }}</div>
                <div class="text-xs">Mints per wallet</div>
              </div>

              <template v-if="isAuthenticated">
                <div
                  class="px-6 py-4 shadow-sm bg-gradient-to-tr from-white/20 rounded-2xl"
                >
                  <div class="font-serif">{{ whitelistRemaining }}</div>
                  <div class="text-xs">Pre-Sale mints remaining</div>
                </div>

                <div
                  class="px-6 py-4 shadow-sm bg-gradient-to-tr from-white/20 rounded-2xl"
                >
                  <div class="font-serif">{{ publicRemaining }}</div>
                  <div class="text-xs">Public mints remaining</div>
                </div>

                <div
                  class="px-6 py-4 shadow-sm bg-gradient-to-tr from-white/20 rounded-2xl"
                >
                  <div class="font-serif">{{ state.estateBalance ?? 0 }}</div>
                  <div class="text-xs">Owned Estates</div>
                </div>
              </template>
            </div>
          </div>

          <div
            class="transition-all duration-200"
            :class="{ 'blur-[2px]': isStateLoading }"
          >
            <Progress
              :total="state.maxGenesis"
              :partial="state.totalSupply"
              :secondary="phaseProgress"
              #="{ progress_partial }"
            >
              <div class="flex items-center text-xs">
                Total minted
                <div class="ml-auto font-semibold">
                  {{ (state.totalSupply ?? 0).toLocaleString() }} of
                  {{ (state.maxGenesis ?? 0).toLocaleString() }} ({{
                    progress_partial.toFixed(2)
                  }}%)
                </div>
              </div>
              <div class="flex items-center text-xs">
                Phase {{ state.mintingPhase }} minted
                <div class="ml-auto font-semibold">
                  {{ phaseMinted.toLocaleString() }} of
                  {{ (state?.maxBatch ?? 0).toLocaleString() }} ({{
                    phaseProgress
                  }}%)
                </div>
              </div>
            </Progress>
          </div>
          <template
            v-if="
              isAuthenticated && (state.publicSaleActive || state.WLSaleActive)
            "
          >
            <div class="grid gap-6" v-if="isStateReady && isWhitelistReady">
              <div
                class="flex flex-col md:flex-row items-start md:items-center gap-4"
              >
                <Counter
                  :min="minCount"
                  :max="maxCount"
                  @change="onCountChange"
                >
                  <template
                    #="{
                      increment,
                      decrement,
                      isIncrementDisabled,
                      isDecrementDisabled,
                      count: counter,
                    }"
                  >
                    <div class="flex items-center gap-4">
                      <Button
                        size="small"
                        @click="decrement()"
                        :disabled="
                          isDecrementDisabled ||
                          (!whitelistRemaining && !publicRemaining)
                        "
                      >
                        <IconMinus class="w-4 h-4" />
                      </Button>
                      <div class="text-center">{{ counter }}</div>
                      <Button
                        size="small"
                        @click="increment()"
                        :disabled="
                          isIncrementDisabled ||
                          (!whitelistRemaining && !publicRemaining)
                        "
                      >
                        <IconPlus class="w-4 h-4" />
                      </Button>
                    </div>
                  </template>
                </Counter>
                <div class="ml-0 md:ml-auto">
                  <div class="flex items-center gap-8">
                    <div class="inline-flex items-center gap-2 shrink-0">
                      <div class="checkbox select-none">
                        <input
                          v-model="mintToStake"
                          type="checkbox"
                          id="mintToStake"
                        />
                        <span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="w-3 h-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clip-rule="evenodd"
                            />
                          </svg>
                        </span>
                        <label for="mintToStake">Stake on Mint</label>
                      </div>
                    </div>
                    <div class="flex items-center gap-4">
                      <Button
                        v-if="state.WLSaleActive"
                        :loading="isWhitelistMintPending"
                        :disabled="
                          isStateLoading ||
                          !state.WLSaleActive ||
                          isWhitelistMintPending ||
                          !whitelistRemaining
                        "
                        @click="
                          whitelistMint(
                            whitelistCount,
                            whitelist.option,
                            mintToStake,
                            whitelist.sig,
                            totalWhitelistPrice
                          )
                        "
                      >
                        Whitelist Mint
                      </Button>
                      <Button
                        v-if="state.publicSaleActive"
                        :loading="isPublicMintPending"
                        :disabled="
                          isStateLoading ||
                          !state.publicSaleActive ||
                          isPublicMintPending ||
                          !publicRemaining
                        "
                        @click="
                          publicMint(
                            publicCount,
                            mintToStake,
                            state.publicSaleKey,
                            totalPublicPrice
                          )
                        "
                      >
                        Public Mint
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="text-sm text-left md:text-right">
                <div v-if="state.WLSaleActive">
                  Total Whitelist Mint price:
                  <span class="text-base font-semibold"
                    >{{ totalWhitelistPrice }} ETH</span
                  >
                </div>
                <div v-if="state.publicSaleActive">
                  Total Public Mint price:
                  <span class="text-base font-semibold"
                    >{{ totalPublicPrice }} ETH</span
                  >
                </div>
              </div>
            </div>
          </template>
          <template v-else-if="!isAuthenticated">
            <div>
              <Button
                :disabled="isAuthenticating"
                :loading="isAuthenticating"
                @click="
                  login(
                    state.publicSaleActive || state.WLSaleActive
                      ? false
                      : { name: 'Inventory' }
                  )
                "
              >
                {{
                  state.publicSaleActive || state.WLSaleActive
                    ? "Connect & Mint"
                    : "Connect & View Inventory"
                }}
              </Button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
