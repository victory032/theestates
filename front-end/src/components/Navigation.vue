<script setup>
import useUser from "@/composables/useUser";
import { sliceAddress } from "@/utils";
import useBalanceStore from "@/stores/balance";
import { ref } from "vue";
import Logo from "@/assets/logo.svg";

const {
  isAuthenticated,
  isAppNetwork,
  isAuthenticating,
  login,
  logout,
  wallet,
  address,
  ens,
} = useUser();
const balanceStore = useBalanceStore();
const isMobile = ref(false);

const menu = [
  {
    name: "Shopping mall",
    to: { name: "Items" },
  },
  {
    name: "Featured",
    to: { name: "Featured" },
  },
  {
    name: "Home",
    to: { name: "Home" },
  },
];

const onOpenNavbar = () => {
  isMobile.value = !isMobile.value;
};
</script>

<template>
  <div
    class="sticky top-0 z-10 flex items-center px-6 tracking-wide border-b shadow-sm backdrop-blur border-b-white/10 bg-white/5 py-4"
  >
    <div class="items-start flex-1">
      <RouterLink
        to="/"
        class="inline-flex text-white transition hover:text-white/70 active:text-white"
      >
        <Logo class="w-auto h-3" />
      </RouterLink>
    </div>
    <!-- nav items -->
    <div
      v-if="isAuthenticated && isAppNetwork"
      class="justify-center gap-8 mx-auto font-serif text-sm font-semibold hidden lg:flex"
    >
      <RouterLink v-for="item in menu" :to="item.to" custom>
        <template #="{ isActive, navigate, href }">
          <a
            :href="href"
            @click="navigate"
            class="transition"
            :class="[
              isActive
                ? 'text-white/50'
                : 'text-white  hover:text-white/70 active:text-white',
            ]"
          >
            {{ item.name }}
          </a>
        </template>
      </RouterLink>
    </div>
    <!-- user loggedin info -->
    <div class="hidden items-center justify-end flex-1 gap-4 lg:flex">
      <div v-if="isAuthenticated">
        <div class="text-sm font-semibold text-white text-right">
          {{ ens ?? sliceAddress(address) }}
        </div>
        <div class="flex items-center justify-end gap-2 text-xs text-white">
          <Spinner v-if="balanceStore.isBalanceLoading" class="w-4 h-4" />
          {{ (balanceStore.balance + balanceStore.rewards).toFixed(2) }}
          {{ balanceStore.symbol }}
        </div>
      </div>
      <Button
        @click="isAuthenticated ? logout() : login()"
        :disabled="isAuthenticating || !wallet || !isAppNetwork"
        :loading="isAuthenticating"
      >
        {{
          wallet
            ? isAppNetwork
              ? isAuthenticated
                ? "Logout"
                : "Connect Wallet"
              : "Wrong Network"
            : "Unable to detect Ethereum provider"
        }}
      </Button>
    </div>
    <!-- mobile nav -->
    <div class="block lg:hidden" @click="onOpenNavbar">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-6 h-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
        />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-6 h-6 hidden"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </div>
  </div>
  <!-- remove hidden and add logic for dynamic -->
  <div
    class="border-b border-gray-400/30 py-8 px-8 block lg:hidden"
    :class="isMobile ? 'block' : 'hidden'"
  >
    <div
      v-if="isAuthenticated && isAppNetwork"
      class="flex flex-col justify-center gap-8 mx-auto font-serif text-sm font-semibold lg:hidden"
    >
      <RouterLink v-for="item in menu" :to="item.to" custom>
        <template #="{ isActive, navigate, href }">
          <a
            :href="href"
            @click="navigate"
            class="transition"
            :class="[
              isActive
                ? 'text-white/50'
                : 'text-white  hover:text-white/70 active:text-white',
            ]"
          >
            {{ item.name }}
          </a>
        </template>
      </RouterLink>
    </div>
    <!-- user loggedin info -->
    <div class="flex flex-col justify-start gap-4 mt-4 lg:hidden">
      <div v-if="isAuthenticated" class="bg-black/30 p-2">
        <div class="text-sm font-semibold text-white text-left">
          {{ ens ?? sliceAddress(address) }}
        </div>
        <div class="flex items-center justify-start gap-2 text-xs text-white">
          <Spinner v-if="balanceStore.isBalanceLoading" class="w-4 h-4" />
          {{ (balanceStore.balance + balanceStore.rewards).toFixed(2) }}
          {{ balanceStore.symbol }}
        </div>
      </div>
      <Button
        @click="isAuthenticated ? logout() : login()"
        :disabled="isAuthenticating || !wallet || !isAppNetwork"
        :loading="isAuthenticating"
      >
        {{
          wallet
            ? isAppNetwork
              ? isAuthenticated
                ? "Logout"
                : "Connect Wallet"
              : "Wrong Network"
            : "Unable to detect Ethereum provider"
        }}
      </Button>
    </div>
  </div>
</template>
