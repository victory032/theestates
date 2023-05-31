import { reactive } from "vue";
import { ethers } from "ethers";
import useUser from "@/composables/useUser";
import abi from "@/abi/equity_test.json";
import useUserStore from "@/stores/user";
export default (address) => {
  const { wallet, isAuthenticated } = useUser();
  const userStore = useUserStore();

  let contract = reactive({});
  const setContract = (payload) =>
    (contract = new ethers.Contract(
      import.meta.env.VITE_TEST_EQUITY_CONTRACT,
      abi,
      payload
    ));

  const symbol = async () => await contract.symbol();
  const totalSupply = async () =>
    await contract
      .totalSupply()
      .then((response) => Number(ethers.utils.formatEther(response)));
  const balanceOf = async (payload) =>
    await contract
      .balanceOf(payload ?? address.value)
      .then((response) => Number(ethers.utils.formatEther(response)));

  const transfer = async (to, amount) =>
    await contract.transfer(to, amount).then((response) => response);

  userStore.$onAction(({ name, after }) => {
    after(() => {
      const actions = {
        setUser: () => setContract(wallet.getSigner()),
        resetUser: () => setContract(wallet),
      };

      actions[name]?.() || null;
    });
  });

  isAuthenticated.value ? setContract(wallet.getSigner()) : setContract(wallet);

  return {
    contract,
    symbol,
    totalSupply,
    balanceOf,
    transfer,
  };
};
