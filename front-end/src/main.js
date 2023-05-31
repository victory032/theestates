import { createApp } from "vue";
import { useStorage, useEventBus } from "@vueuse/core";
import { createPinia } from "pinia";
import { ethers } from "ethers";
import Notifications from "notiwind";
import App from "@/AppSuspense.vue";
import router from "@/router";
import wallet from "@/plugins/wallet";
import useUserStore from "@/stores/user";
import { useAccordion } from "vue3-rich-accordion";
import "vue3-rich-accordion/accordion-library-styles.css";
import "@/assets/app.postcss";
import "flowbite";
// import detectEthereumProvider from '@metamask/detect-provider'

const pinia = createPinia();
const userStore = useUserStore(pinia);

const connect = async () => {
  try {
    const provider = window?.ethereum || null;
    if (!provider) throw new Error("Unable to detect Ethereum provider");
    const connection = new ethers.providers.Web3Provider(provider);
    return Promise.resolve(connection);
  } catch (error) {
    return Promise.reject(error);
  }
};

const onAccountsChanged = async (accounts) => {
  const [address] = accounts;

  if (!address) {
    userStore.resetUser();
    router.replace({ name: "Items" });
    return;
  }

  const ens = await connection.lookupAddress(address);
  userStore.setUser(address, ens);

  const { emit: emitAppEvent } = useEventBus("app");
  emitAppEvent({ type: "accountsChanged", payload: accounts });
};

let connection;

const persistState = async () => {
  try {
    connection = await connect();

    const chainId = await connection.provider.request({
      method: "eth_chainId",
    });
    userStore.setChainId(chainId);

    const addressStorage = useStorage("address", null);
    const [address] = await connection.provider.request({
      method: "eth_accounts",
    });
    if (
      address &&
      addressStorage.value === address &&
      chainId === import.meta.env.VITE_NETWORK
    )
      await onAccountsChanged([address]);

    connection.provider.on("accountsChanged", onAccountsChanged);
    connection.provider.on("chainChanged", () => window.location.reload());

    return Promise.resolve(connection);
  } catch (error) {
    return Promise.reject(error);
  }
};

persistState()
  .then((c) => {
    connection = c;
  })
  .finally(() => {
    createApp(App)
      .use(pinia)
      .use(wallet, connection)
      .use(router)
      .use(useAccordion)
      .use(Notifications)
      .mount("#app");
  });
