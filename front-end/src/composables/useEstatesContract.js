import { reactive } from "vue";
import { ethers } from "ethers";
import useUser from "@/composables/useUser";
import abi from "@/abi/estates.json";
import useUserStore from "@/stores/user";

export default (address) => {
  const { wallet, isAuthenticated } = useUser();
  const userStore = useUserStore();

  let contract = reactive({});
  const setContract = (payload) =>
    (contract = new ethers.Contract(
      import.meta.env.VITE_TEST_ESTATE_CONTRACT,
      abi,
      payload
    ));

  const tokensOfOwner = async (payload) =>
    await contract.tokensOfOwner(payload ?? address.value);

  const ownerOf = async (payload) =>
    await contract.ownerOf(payload ?? address.value);

  const estateGeneration = async (id) =>
    await contract.estateGeneration(id).then((res) => res.toNumber() + 1);

  const tokenURI = async (id) => await contract.tokenURI(id);

  const maxBatch = async () =>
    await contract.maxBatch().then((response) => response.toNumber());
  const maxGenesis = async () =>
    await contract.maxGenesis().then((response) => response.toNumber());
  const totalSupply = async () =>
    await contract.totalSupply().then((response) => response.toNumber());

  const mintingPhase = async () =>
    await contract.mintingPhase().then((response) => response.toNumber());

  const PublicPrice = async () =>
    await contract
      .PublicPrice()
      .then((response) => Number(ethers.utils.formatEther(response)));
  const publicSaleKey = async () =>
    await contract.publicSaleKey().then((response) => response.toNumber());
  const publicSaleActive = async () => await contract.publicSaleActive();

  const WLPrice = async () =>
    await contract
      .WLPrice()
      .then((response) => Number(ethers.utils.formatEther(response)));
  const WLSaleActive = async () => await contract.WLSaleActive();

  const maxPerWL = async () =>
    await contract.OG_MAX_MINTS().then((response) => response.toNumber());
  const maxPerPSL = async () =>
    await contract.PSL_MAX_MINTS().then((response) => response.toNumber());
  const maxPerAddress = async () =>
    await contract.ADDRESS_MAX_MINTS().then((response) => response.toNumber());

  const WLMintsOnAddress = async (phase, payload) =>
    await contract
      .numberOfWLMintsOnAddress(phase, payload ?? address.value)
      .then((response) => response.toNumber());
  const publicMintsOnAddress = async (phase, payload) =>
    await contract
      .numberOfPublicMintsOnAddress(phase, payload ?? address.value)
      .then((response) => response.toNumber());

  const mintWhitelist = async (vol, opt, mintToStake, signature, ether) =>
    await contract.privateMint(
      import.meta.env.VITE_CONTRACT_ESTATES,
      vol,
      opt,
      mintToStake,
      signature,
      { value: ethers.utils.parseEther(ether) }
    );
  const mintPublic = async (vol, mintToStake, publicSaleKey, ether) =>
    await contract.publicMint(vol, mintToStake, publicSaleKey, {
      value: ethers.utils.parseEther(ether),
    });

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
    tokensOfOwner,
    ownerOf,
    estateGeneration,
    tokenURI,
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
  };
};
