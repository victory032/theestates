import { reactive } from "vue";
import { ethers } from "ethers";
import useUser from "@/composables/useUser";
import abi from "@/abi/staking.json";
import useUserStore from "@/stores/user";

export default (address) => {
  const { wallet, isAuthenticated } = useUser();
  const userStore = useUserStore();

  let contract = reactive({});
  const setContract = (payload) =>
    (contract = new ethers.Contract(
      import.meta.env.VITE_TEST_STAKING_CONTRACT,
      abi,
      payload
    ));

  const viewStakes = async (payload) =>
    await contract.viewStakes(payload ?? address.value);

  const stakes = async (id) =>
    await contract.stakes(id).then(([owner, staked_at]) => ({
      owner: owner.toLowerCase(),
      staked_at: staked_at.toNumber() * 1000,
    }));

  const BASE_RATE = async () =>
    await contract
      .BASE_RATE()
      .then((response) => Number(ethers.utils.formatEther(response)));
  const LOCK_IN = async () =>
    await contract.LOCK_IN().then((response) => response.toNumber() * 1000);
  const getTotalUnclaimed = async (payload) =>
    await contract
      .getTotalUnclaimed(payload ?? address.value)
      .then((response) => Number(ethers.utils.formatEther(response)));

  const withdrawEquity = async () => await contract.withdrawEquity();

  const generationBalance = async (payload) =>
    await contract
      .generationBalance(payload ?? address.value)
      .then(([gen1, gen2, gen3, gen4]) => ({
        1: gen1.toNumber(),
        2: gen2.toNumber(),
        3: gen3.toNumber(),
        4: gen4.toNumber(),
      }));

  const balanceOf = async (payload) =>
    await contract
      .balanceOf(payload ?? address.value)
      .then((response) => response.toNumber());

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
    viewStakes,
    stakes,
    BASE_RATE,
    LOCK_IN,
    getTotalUnclaimed,
    withdrawEquity,
    generationBalance,
    balanceOf,
  };
};
