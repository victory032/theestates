import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

const chains = {
  "0x1": {
    name: "Ethereum Mainnet",
    explorer: "https://etherscan.io",
  },
  "0x3": {
    name: "Ropsten Testnet",
    explorer: "https://ropsten.etherscan.io",
  },
  "0x4": {
    name: "Rinkeby Testnet",
    explorer: "https://rinkeby.etherscan.io",
  },
  "0x5": {
    name: "Goerli Testnet",
    explorer: "https://goerli.etherscan.io",
  },
  "0x2a": {
    name: "Kovan Testnet",
    explorer: "https://kovan.etherscan.io",
  },
};

const userStore = defineStore("user", () => {
  const address = ref(null);
  const ens = ref(null);
  const chainId = ref(null);

  const addressStorage = useStorage("address", null);

  const isAuthenticated = computed(() => Boolean(address.value));
  const isAppNetwork = computed(
    () => chainId.value === import.meta.env.VITE_NETWORK
  );

  const chainName = computed(() => chains[chainId.value].name ?? null);
  const appChainName = computed(
    () => chains[import.meta.env.VITE_NETWORK].name ?? null
  );
  const appBlockExplorer = computed(
    () => chains[import.meta.env.VITE_NETWORK].explorer ?? null
  );

  const setUser = (a, e) => {
    address.value = a;
    ens.value = e;

    addressStorage.value = a;
  };

  const setChainId = (c) => {
    chainId.value = c;
  };

  const resetUser = () => {
    address.value = null;
    ens.value = null;

    addressStorage.value = null;
  };

  return {
    address,
    ens,
    chainId,
    chainName,
    isAuthenticated,
    isAppNetwork,
    setUser,
    resetUser,
    setChainId,
    appChainName,
    appBlockExplorer,
  };
});

export default userStore;
