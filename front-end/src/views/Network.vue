<script setup>
import { ref } from "vue";
import { useUser } from "@/composables";
import Logo from "@/assets/logo.svg";

const { wallet, appChainName } = useUser();
const isSwitching = ref(false);

const switchNetwork = async () => {
  console.log(import.meta.env.VITE_NETWORK);
  try {
    isSwitching.value = true;
    await wallet.provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: import.meta.env.VITE_NETWORK }],
    });
  } catch (error) {
    notify({
      type: "error",
      title: "Network",
      text: error.message,
    });
  } finally {
    isSwitching.value = false;
  }
};
</script>

<template>
  <div class="container flex justify-center text-center">
    <div class="grid gap-6">
      <Logo class="h-8 mx-auto" />
      <div class="grid gap-8">
        <template v-if="wallet">
          <div>
            The Estates dApp requires {{ appChainName }} to be active network
          </div>
          <div>
            <Button
              @click="switchNetwork()"
              :loading="isSwitching"
              :disabled="isSwitching"
              >Switch Network</Button
            >
          </div>
        </template>
        <template v-else>
          <div>Unable to detect Ethereum provider</div>
          <div>
            <a
              href="https://metamask.io/download"
              target="_blank"
              class="button button--default button--black"
              >Install MetaMask for your browser</a
            >
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
