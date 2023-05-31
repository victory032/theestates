<script setup>
import { ref, computed, reactive, toRaw, onMounted } from "vue";
import { Carousel, Slide, Pagination, Navigation } from "vue3-carousel";
import "vue3-carousel/dist/carousel.css";
import { useEventBus } from "@vueuse/core";
import {
  useEstatesContract,
  useStakingContract,
  useUser,
  useShoppingApi,
} from "@/composables";
import EstateCardForItems from "../components/EstateCardForItems.vue";
import IconDownload from "@/assets/icons/download.svg";
import useItemStore from "@/stores/item";
import Sidebar from "../components/Sidebar.vue";

const { on: onAppEvent, emit: emitAppEvent } = useEventBus("app");
const { address } = useUser();
const itemStore = useItemStore();
const filterData = ref(null);
const itemsBucket = itemStore.itemsBucket;
const apiShopping = useShoppingApi();
const open = ref(false);

onMounted(() => {
  itemStore.loadFilterData();
});

const inventory = reactive({
  loading: ref(false),
  tokens: ref([]),
});

const { contract: estates, tokensOfOwner } = useEstatesContract(address);
const {
  contract: staking,
  viewStakes,
  LOCK_IN,
  generationBalance,
} = useStakingContract(address);

const selectedToken = reactive({
  value: ref(),
});

const onTokenLoading = (token) => {
  const index = inventory.tokens.findIndex((t) => t.id === token.id);
  inventory.tokens[index] = {
    ...inventory.tokens[index],
    ...token,
  };
};

const getTokens = async () => {
  try {
    const [unstaked, staked] = await Promise.all([
      tokensOfOwner(),
      viewStakes(),
    ]);

    const result = [
      ...unstaked.map((item) => ({ id: item.toNumber(), status: "unstaked" })),
      ...staked.map((item) => ({ id: item.toNumber(), status: "staked" })),
    ];

    return Promise.resolve(result);
  } catch (err) {
    return Promise.reject(err);
  }
};

const loadInventory = async () => {
  try {
    inventory.loading = true;
    inventory.locktime = await LOCK_IN();
    inventory.tokens = await getTokens();
    return Promise.resolve(inventory);
  } catch (err) {
    return Promise.reject(err);
  } finally {
    inventory.loading = false;
  }
};

const onTokenSelected = (token) => {
  selectedToken.value = token;
  itemStore.setSelectedToken(token);

  apiShopping
    .get(`/items/selected/${token.id}`)
    .then((res) => {
      itemStore.setAssociatedItems(res.data.associatedItems);
    })
    .catch((err) => {});
};

const isTokenSelected = (token) => {
  if (!selectedToken.value) return false;
  return selectedToken.value.id === token.id;
};

const downloadItem = (url, name) => {
  axios
    .get(url, { responseType: "blob" })
    .then((response) => {
      const blob = new Blob([response.data], { type: "application/glb" });
      const link = document.createElement("a");
      link.setAttribute("download", name + ".glb");
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    })
    .catch((err) => {
      console.log(err);
    });
};

onAppEvent(({ type }) => {
  const events = {
    accountsChanged: () => loadInventory(),
  };

  events[type]?.() ?? null;
});

const breakpoints = {
  768: {
    itemsToShow: 1,
    snapAlign: "right",
  },

  // 1024 and up
  1100: {
    itemsToShow: 1,
    snapAlign: "right",
  },
};

loadInventory();
</script>
<style>
@import "../assets/css/items.css";
</style>
<template>
  <div class="self-start w-full py-12">
    <div class="mx-auto px-10">
      <!-- sidebar collapse -->
      <!-- In mobile, will display -->
      <div class="block lg:hidden">
        <div class="p-2 inventory-border">
          <div
            class="body dark-background"
            style="
              background-image: url(https://i.ibb.co/nrmkm7d/five-bells-washed-out-logo.png),
                linear-gradient(
                  to right,
                  rgba(58, 61, 62, 1) 0%,
                  rgba(58, 61, 62, 1) 100%
                );
            "
          >
            <div class="outer-border">
              <div class="mid-border">
                <div class="inner-border">
                  <img
                    class="corner-decoration corner-left-top"
                    src="https://i.ibb.co/4mKvK3N/corner-decoration.jpg"
                  />
                  <img
                    class="corner-decoration corner-right-top"
                    src="https://i.ibb.co/4mKvK3N/corner-decoration.jpg"
                  />
                  <img
                    class="corner-decoration corner-right-bottom"
                    src="https://i.ibb.co/4mKvK3N/corner-decoration.jpg"
                  />
                  <img
                    class="corner-decoration corner-left-bottom"
                    src="https://i.ibb.co/4mKvK3N/corner-decoration.jpg"
                  />

                  <img
                    class="vertical-decoration bottom"
                    src="https://i.ibb.co/JRTK9z4/horizontally-centered-vertical-decoration.png"
                  />

                  <!-- Page Content -->
                  <div class="container">
                    <div class="row social-row"></div>
                    <div class="row">
                      <div class="col-lg-12 text-center">
                        <carousel
                          v-if="inventory.tokens.length !== 0"
                          :wrap-around="true"
                          :breakpoints="breakpoints"
                        >
                          <slide
                            v-for="token in inventory.tokens"
                            :key="token.id"
                          >
                            <EstateCardForItems
                              :id="token.id"
                              as="button"
                              :active="isTokenSelected(token)"
                              @click="onTokenSelected(token)"
                              @load="onTokenLoading"
                            />
                          </slide>
                          <template #addons>
                            <Navigation />
                            <Pagination />
                          </template>
                        </carousel>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="p-4 items-inventory">
          <div class="text-center">No items for this estate...</div>
        </div>
      </div>
      <!-- main layout in desktop -->
      <div
        class="grid grid-cols-1 lg:grid-cols-12 gap-12 reverse flex-col-reverse"
      >
        <div class="col-span-1 lg:col-span-2">
          <Sidebar :filterData="itemStore.filterData" />
        </div>
        <div class="col-span-1 lg:col-span-7">
          <div
            v-if="itemsBucket.items.length !== 0"
            class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3"
          >
            <ItemCard
              as="div"
              v-for="item in itemsBucket.items"
              :isSelectedToken="selectedToken.value ? true : false"
              :item="item"
            />
          </div>
        </div>
        <div class="col-span-3 hidden lg:block">
          <div class="p-2 inventory-border">
            <div
              class="body dark-background"
              style="
                background-image: url(https://i.ibb.co/nrmkm7d/five-bells-washed-out-logo.png),
                  linear-gradient(
                    to right,
                    rgba(58, 61, 62, 1) 0%,
                    rgba(58, 61, 62, 1) 100%
                  );
              "
            >
              <div class="outer-border">
                <div
                  class="mid-border"
                  :class="inventory.tokens.length === 0 && '!h-[150px]'"
                >
                  <div class="inner-border">
                    <img
                      class="corner-decoration corner-left-top"
                      src="https://i.ibb.co/4mKvK3N/corner-decoration.jpg"
                    />
                    <img
                      class="corner-decoration corner-right-top"
                      src="https://i.ibb.co/4mKvK3N/corner-decoration.jpg"
                    />
                    <img
                      class="corner-decoration corner-right-bottom"
                      src="https://i.ibb.co/4mKvK3N/corner-decoration.jpg"
                    />
                    <img
                      class="corner-decoration corner-left-bottom"
                      src="https://i.ibb.co/4mKvK3N/corner-decoration.jpg"
                    />

                    <img
                      class="vertical-decoration bottom"
                      src="https://i.ibb.co/JRTK9z4/horizontally-centered-vertical-decoration.png"
                    />

                    <!-- Page Content -->
                    <div class="px-[5px] mx-auto">
                      <div class="row social-row"></div>
                      <div class="row">
                        <div
                          class="col-lg-12 text-center"
                          v-if="inventory.tokens.length !== 0"
                        >
                          <carousel
                            :wrap-around="true"
                            :breakpoints="breakpoints"
                          >
                            <slide
                              v-for="token in inventory.tokens"
                              :key="token.id"
                            >
                              <EstateCardForItems
                                :id="token.id"
                                as="button"
                                :active="isTokenSelected(token)"
                                @click="onTokenSelected(token)"
                                @load="onTokenLoading"
                              />
                            </slide>
                            <template #addons>
                              <Navigation />
                              <Pagination />
                            </template>
                          </carousel>
                        </div>
                        <div v-else>
                          <h1 class="text-[15px] text-[#ffc175] font-medium">
                            NO NFT
                          </h1>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="p-4 items-inventory bg-[#b964211c]">
            <div
              class="text-center border-b border-[#ff5e003d] border-solid font-bold black-emboss"
            >
              {{
                selectedToken.value ? selectedToken?.value?.metadata?.name : ""
              }}
            </div>
            <div v-if="selectedToken.value">
              <div v-if="itemStore.associatedItems.length !== 0">
                <div
                  v-for="record in itemStore.associatedItems"
                  class="flex items-center gap-3 my-2"
                >
                  <div
                    class="border-2 border-[ridge] border-[#ff9136] relative"
                  >
                    <div class="item-inset-shadow">
                      <img
                        :src="record.item?.image_url"
                        alt="Item"
                        class="w-12 h-12"
                      />
                    </div>
                  </div>

                  <span class="md-list-item-text black-emboss">{{
                    record.item?.name
                  }}</span>

                  <button
                    class="md-icon-button md-list-action"
                    @click="
                      downloadItem(record.item.model_url, record.item?.name)
                    "
                  >
                    <IconDownload class="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div v-else class="text-center text-[12px]">NO ITEMS</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
