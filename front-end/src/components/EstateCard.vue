<script setup>
import { toRefs, computed, useSlots, ref } from "vue";
import { useEventBus } from "@vueuse/core";

import useEstate from "@/composables/useEstate";
import useUser from "@/composables/useUser";

import IconDownload from "@/assets/icons/download.svg";
import IconEye from "@/assets/icons/eye.svg";

const { on: onAppEvent } = useEventBus("app");

const props = defineProps(["id", "active", "locked", "as"]);
const { id, active, locked, as } = toRefs(props);

const emit = defineEmits(["load"]);

const slots = useSlots();

const { address } = useUser();

const {
  token,
  isTokenLoading,
  isTokenReady,
  isTokenRevealed,
  loadToken,
  downloadToken,
  isTokenDownloading,
} = useEstate(id, { resetOnExecute: false, immediate: false });

const isTokenOwned = computed(
  () =>
    token.value?.owner.toLowerCase() === address.value ||
    token.value?.owner_stake?.toLowerCase() === address.value
);
const isImageLoaded = ref(false);

loadToken().then((token) => {
  emit("load", token);
});

const onImageLoad = () => (isImageLoaded.value = true);

onAppEvent(({ type, payload }) => {
  const events = {
    tokensChanged: () => {
      const foundToken = payload.find((token) => token.id === id.value);
      if (foundToken) {
        loadToken().then((token) => {
          emit("load", {
            ...token,
            ...foundToken,
          });
        });
      }
    },
  };

  events[type]?.() ?? null;
});
</script>

<template>
  <component
    :is="as"
    class="relative text-left transition bg-black/10 bg-gradient-to-tr from-white/10 rounded-2xl aspect-square"
    :class="[
      active ? 'ring-2 ring-white shadow-xl' : 'shadow-sm',
      { 'grayscale cursor-not-allowed': locked },
    ]"
  >
    <div
      v-if="isTokenLoading || isTokenDownloading || !isImageLoaded"
      class="absolute top-0 left-0 z-10 flex items-center justify-center w-full h-full text-left backdrop-blur-sm rounded-2xl"
    >
      <Spinner class="w-8 h-8" />
    </div>
    <div v-if="slots.label" class="absolute top-4 left-6 z-[1]">
      <slot name="label" />
    </div>
    <div class="absolute top-4 right-4 z-[1]">
      <div class="flex items-center gap-2">
        <!-- <RouterLink
          v-if="isTokenReady"
          :to="{ name: 'Token', params: { id: token?.id } }"
          class="text-white transition hover:text-white/70 active:text-white focus:text-white/70 focus:outline-none"
          @click.stop
        >
          <IconEye class="w-5 h-5" />
        </RouterLink> -->
        <button
          class="text-white transition hover:text-white/70 active:text-white focus:text-white/70 focus:outline-none"
          @click.stop="downloadToken(0, address)"
          v-if="isTokenOwned && isTokenRevealed"
        >
          <IconDownload class="w-5 h-5" />
        </button>
      </div>
    </div>
    <Transition name="fade">
      <img
        :src="token?.metadata.image"
        :alt="token?.metadata.name"
        class="aspect-square rounded-2xl"
        :class="{ 'animate-pulse': active }"
        @load="onImageLoad"
        v-show="isImageLoaded"
      />
    </Transition>
    <div
      class="absolute bottom-0 left-0 grid w-full gap-2 px-8 py-6 rounded-b-2xl"
      v-if="isTokenReady"
    >
      <div>
        <div class="text-[10px] leading-tight">
          Generation {{ token?.generation }}
        </div>
        <div class="font-semibold leading-tight">
          {{ token?.metadata.name }}
        </div>
      </div>
      <slot v-if="slots.description" name="description" />
    </div>
  </component>
</template>
