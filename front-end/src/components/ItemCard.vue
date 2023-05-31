<script setup>
import { toRefs, ref, reactive, onMounted, nextTick } from "vue";
import { useEventBus } from "@vueuse/core";
import { ethers } from "ethers";
import useUser from "@/composables/useUser";
import { useShoppingApi } from "@/composables";
import useEquityContract from "@/composables/useEquityContract";
import { notify } from "notiwind";
import VueCountdown from "@chenfengyuan/vue-countdown";
import useItemStore from "@/stores/item";
import BuyIcon from "@/assets/icons/buy.svg";
import SoldIcon from "@/assets/icons/sold-icon.svg";
import "../assets/css/itemcard.css";
const { on: onAppEvent } = useEventBus("app");
const isImageLoaded = ref(false);

const props = defineProps(["id", "item", "isSelectedToken", "refContainer"]);
const itemStore = useItemStore();
const api = useShoppingApi();
const isLoading = ref(false);
const { item, isSelectedToken, refContainer } = toRefs(props);
const { address } = useUser();
const { transfer } = useEquityContract(address);

onMounted(async () => {
  await nextTick();
});
const onImageLoad = () => (isImageLoaded.value = true);

const onBuyItem = async (id) => {
  if (!isSelectedToken.value) {
    notify({
      type: "generic",
      title: "Information",
      text: "Please choose an NFT that can be associated with items",
    });
    return;
  }
  isLoading.value = true;
  const buyPrice = calDiscountRate(item.value.price, item.value.reduction_rate);
  const amountBn = ethers.utils.parseEther(buyPrice.toString());
  try {
    const result = await transfer(
      "0xd30E43F1c04eC33625aCDC411CeE87a80afa4Ed2",
      amountBn
    );
    console.log("BUY RESULT", result.hash);
    notify({
      type: "success",
      title: "Transfer succeed",
      text: `${buyPrice} EQY is transferred successfully`,
    });
    api
      .post("/buy-item", {
        itemId: item.value.id,
        itemOrganizeId: item.value.organizedId,
        owner: itemStore.selectedToken.owner,
        nftId: itemStore.selectedToken.id,
        nftName: itemStore.selectedToken.metadata.name,
        tx: result.hash,
      })
      .then((res) => {
        if (res.data.status === 0) {
          notify({
            type: "error",
            title: "Exceed amount",
            text: "This item is sold out",
          });
          return;
        }
        itemStore.updateAssociatedItems(res.data.itemRecord);
        itemStore.updateItemSoldAmount(res.data.estateItem);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        isLoading.value = false;
      });
  } catch (err) {
    notify({
      type: "error",
      title: "Paying " + buyPrice + "EQY",
      text: err.reason ?? err.message,
    });
    console.log(err);
    return;
  }
};

const isOnSale = (soldAmount, totalAmount, start_date, end_date) => {
  if (
    start_date === end_date &&
    (totalAmount === -1 || totalAmount - soldAmount > 0)
  ) {
    return true;
  }
  if (!start_date) {
    if (totalAmount === -1) {
      return true;
    } else if (totalAmount - soldAmount > 0) {
      return true;
    } else {
      return false;
    }
  } else {
    if (totalAmount === -1 && diff(end_date) > 0) {
      return true;
    } else if (totalAmount - soldAmount > 0 && diff(end_date) > 0) {
      return true;
    } else {
      return false;
    }
  }
};

const calDiscountRate = (origin, rate) => {
  return Number(origin - (origin * rate) / 100).toFixed(2);
};

const isAuctionItem = (start_date, end_date) => {
  if (!start_date && !end_date) {
    return false;
  }

  const result =
    new Date(end_date).getTime() - new Date(start_date).getTime() !== 0;
  return result;
};

const diff = (end_date) => {
  const miliDiff = new Date(end_date).getTime() - new Date().getTime();
  const seconds = Math.floor(miliDiff);
  if (seconds < 0) return 0;
  return seconds;
};

const pad = (num, size) => {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
};
</script>

<template>
  <div
    class="relative text-left transition bg-black/10 bg-gradient-to-b from-white/10 to-black/10 aspect-square rounded-[8px]"
  >
    <div class="ribbon ribbon-top-left" v-if="item?.reduction_rate">
      <span>{{ `-${item?.reduction_rate}%` }}</span>
    </div>

    <div
      v-if="!isImageLoaded"
      class="absolute top-0 left-0 z-10 flex items-center justify-center w-full h-full text-left backdrop-blur-sm"
    >
      <Spinner class="w-8 h-8" />
    </div>

    <div class="absolute bottom-2 right-0 z-[1] overflow-hidden">
      <div class="flex items-center gap-2">
        <button
          v-if="
            isOnSale(
              item?.sold_amount,
              item?.quantity,
              item?.start_date,
              item?.end_date
            )
          "
          type="button"
          title="Buy Now"
          @click="onBuyItem(0)"
          class="text-[#ddd] hover:text-[#fff] focus:outline-none px-2 text-center bar-button bg-[#cb9f3c]"
        >
          <BuyIcon />
        </button>
        <button v-else class="bg-[#812727] px-2 bar-button">
          <SoldIcon />
        </button>
      </div>
    </div>
    <!-- Take care this part -->
    <div class="relative h-full w-full">
      <div
        class="badge-promo"
        :class="
          !isOnSale(
            item?.sold_amount,
            item?.quantity,
            item?.start_date,
            item?.end_date
          ) && `before:!bg-[#3e3e3e] after:!bg-[#707070]`
        "
      >
        <div
          v-if="
            isOnSale(
              item?.sold_amount,
              item?.quantity,
              item?.start_date,
              item?.end_date
            )
          "
          class="glow-button"
        ></div>
        <span class="badge-promo-content black-emboss">
          {{
            `${item?.type?.name} #${pad(item?.id, 3)} - ${item?.color?.name}`
          }}
        </span>
      </div>

      <div class="absolute right-0 top-10 z-10">
        <span class="text-[14px] rounded-l-xl bg-[#d19528] px-3 py-1">{{
          `${item?.quantity !== -1 ? item?.quantity : "∞"} / ${
            item?.sold_amount || "0"
          }`
        }}</span>
      </div>
      <div class="absolute bottom-0 right-0 w-full">
        <Transition name="fade" class="relative">
          <div class="item-inset-shadow">
            <img
              :src="item?.image_url"
              class="aspect-square rounded-tr-[7px] rounded-tl-[7px]"
              @load="onImageLoad"
              v-show="isImageLoaded"
            />
          </div>
        </Transition>
      </div>

      <div
        class="absolute bottom-0 bg-gradient-to-b from-[#3e3e3e40] via-[#3e3e3e80] to-[#000000d6] w-full h-full image-border"
      ></div>

      <div class="absolute bottom-0 w-full gap-4 px-3 py-3 rounded-b-2xl">
        <div class="text-center w-full">
          <div>
            <vue-countdown
              v-if="isAuctionItem(item?.start_date, item?.end_date)"
              :time="diff(item?.end_date)"
              v-slot="{ days, hours, minutes, seconds }"
            >
              {{ days }} : {{ hours }} : {{ minutes }} : {{ seconds }}
            </vue-countdown>
          </div>

          <div
            class="font-semibold leading-tight text-[#d5d5d5] w-full break-words"
            :style="{ color: `${item?.rarity.color}` }"
            :title="item?.rarity.name"
          >
            {{ item?.name }}
          </div>
          <div
            class="font-semibold leading-tight text-[#dbc425] flex items-center justify-center mt-1"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            &nbsp;
            <span
              class="text-[0.8rem]"
              v-if="item?.reduction_rate === 0 || item.reduction_rate === null"
              >{{ item?.price }}
              {{ item?.currency_type === "0" ? "ETH" : "EQY" }}
            </span>
            <span class="text-[0.8rem]" v-else>
              <del class="text-[#aaa]">{{ item?.price }}</del> /
              <span class="">{{
                calDiscountRate(item?.price, item?.reduction_rate)
              }}</span>
              {{ item?.currency_type === "0" ? "ETH" : "EQY" }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
