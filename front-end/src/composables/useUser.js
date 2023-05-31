import { inject, ref } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import useUserStore from "@/stores/user";
import { notify } from "notiwind";
import { sliceAddress } from "@/utils";

export default () => {
  const wallet = inject("wallet");
  const router = useRouter();
  const userStore = useUserStore();
  const {
    address,
    ens,
    isAuthenticated,
    chainName,
    isAppNetwork,
    appChainName,
    appBlockExplorer,
  } = storeToRefs(userStore);
  const { setUser, resetUser } = userStore;
  const isAuthenticating = ref(false);

  const login = async (route = { name: "Items" }) => {
    try {
      isAuthenticating.value = true;
      const [a] = await wallet.provider.request({
        method: "eth_requestAccounts",
      });
      const e = await wallet.lookupAddress(a);
      setUser(a, e);
      notify({
        type: "success",
        title: "Authorization",
        text: `Successfully connected as ${e || sliceAddress(a)}`,
      });
      if (route) router.replace(route);
    } catch (error) {
      notify({
        type: "error",
        title: "Authorization",
        text: error.message,
      });
    } finally {
      isAuthenticating.value = false;
    }
  };

  const logout = async () => {
    resetUser();
    router.replace({ name: "Items" });
  };

  return {
    wallet,
    address,
    ens,
    isAuthenticated,
    isAuthenticating,
    setUser,
    resetUser,
    login,
    logout,
    chainName,
    isAppNetwork,
    appChainName,
    appBlockExplorer,
  };
};
