import { ref, computed } from "vue";
import { defineStore } from "pinia";
import useStakingContract from "@/composables/useStakingContract";
import useEquityContract from "@/composables/useEquityContract";
import useUser from "@/composables/useUser";

const balanceStore = defineStore("balance", () => {
  const { address } = useUser();
  const { balanceOf, symbol: equitySymbol } = useEquityContract(address);
  const { getTotalUnclaimed } = useStakingContract(address);

  const balance = ref(0);
  const rewards = ref(0);
  const symbol = ref("EQY");
  const isBalanceLoading = ref(false);

  const setBalance = (payload) => {
    balance.value = payload.balance;
    rewards.value = payload.rewards;
    symbol.value = payload.symbol;
  };

  const resetBalance = () => {
    balance.value = 0;
    rewards.value = 0;
    symbol.value = "EQY";
  };

  const loadBalance = async () => {
    try {
      isBalanceLoading.value = true;

      const [balance, rewards, symbol] = await Promise.all([
        balanceOf(),
        getTotalUnclaimed(),
        equitySymbol(),
      ]);

      setBalance({ balance, rewards, symbol });

      return Promise.resolve({ balance, rewards, symbol });
    } catch (error) {
      return Promise.reject(error);
    } finally {
      isBalanceLoading.value = false;
    }
  };

  return {
    balance,
    rewards,
    symbol,
    setBalance,
    resetBalance,
    loadBalance,
    isBalanceLoading,
  };
});

export default balanceStore;
