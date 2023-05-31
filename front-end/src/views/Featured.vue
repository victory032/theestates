<script setup>
import { ref, reactive, onMounted, nextTick } from "vue";
import useItemStore from "@/stores/item";
import useShoppingApi from "@/composables/useShoppingApi";
import TileCard from "@/components/TileCard.vue";
import FeaturedCardVue from "@/components/FeaturedCard.vue";
import "@/assets/css/itemcard.css";
import "@/assets/css/featured.css";

let slideIndex = 1;
const itemStore = useItemStore();
const shoppingApi = useShoppingApi();
const popularItems = reactive({ value: ref([]) });
const carouselData = ref([]);
itemStore.loadItemsBucket();
console.log(itemStore.advertisement);
const showSlides = (n) => {
  let i;
  let slides = document.getElementsByClassName("slide-item");

  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }

  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  slides[slideIndex - 1].style.display = "block";
};

onMounted(async () => {
  try {
    const response = await shoppingApi.get("/get-carousels");
    carouselData.value = response.data.carousels;

    const tileRes = await shoppingApi.get("/get-tile-item-data");
    itemStore.tileItems = tileRes.data.tileItems;

    const popularRes = await shoppingApi.get("/get-popular-items");
    popularItems.value = popularRes.data.popularItems;

    const carouselContainer = document.getElementById("carousel-id");
    const btns = carouselContainer.getElementsByClassName("tile-btn");

    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function () {
        let current = document.getElementsByClassName("tile-active");
        if (current.length > 0) {
          current[0].className = current[0].className.replace(
            "tile-active",
            ""
          );
        }
        this.className += " tile-active";
        showSlides((slideIndex = Number(this.textContent)));
      });
    }

    await nextTick();
    showSlides(slideIndex);
  } catch (err) {
    console.log(err);
  }
});
</script>

<template>
  <section class="self-start w-full py-3">
    <div class="container mx-auto">
      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-12 md:col-span-7 slideshow-container aspect-[9/6]">
          <div class="relative flex-grow h-full">
            <div
              class="relative slide-item fade h-full"
              v-for="(carousel, index) in carouselData"
              :key="'Carousel' + index"
            >
              <div class="!rounded-none h-full">
                <img :src="carousel.imageUrl" class="w-full h-full" />
              </div>
              <div
                class="absolute bottom-0 bg-gradient-to-b from-[#3e3e3e40] via-[#3e3e3e80] to-[#000000d6] w-full h-full image-border !rounded-none"
              ></div>
              <div class="absolute left-8 bottom-20">
                <h3 class="text-[#cbaa50cc] font-semibold">
                  {{ carousel.typeHeading }}
                </h3>
                <h2 class="text-[#cfcfcf] font-semibold text-[25px] ml-1">
                  {{ carousel.mainHeading }}
                </h2>
                <h5 class="font-light text-[#f7dfb48a]">
                  {{ carousel.subHeading }}
                </h5>
              </div>
            </div>

            <div class="absolute right-8 bottom-8">
              <ul class="carousel-buttons" id="carousel-id">
                <li
                  v-for="(carousel, index) in carouselData"
                  class="tile-btn"
                  :class="index === 0 && 'tile-active'"
                >
                  {{ index + 1 }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="col-span-12 md:col-span-5 grid grid-cols-2 gap-3">
          <TileCard
            as="div"
            class="col-span-1"
            v-for="tileItem in itemStore?.tileItems"
            :tileItem="tileItem"
          />
        </div>
      </div>
      <!-- End of Tile and Carousel -->
      <div
        class="flex h-20 my-10 bg-[#020b1ea8] border-2 border-[#525252] ridge"
      >
        <img src="/sale.png" class="rotate-[-13deg] ml-3 mr-10" />
        <div class="flex flex-col align-start justify-center tracking-wide">
          <h1 class="font-conthrax text-[#ffcd71] text-[18px]">
            {{ itemStore.advertisement.title }}
          </h1>
          <p class="text-[#c3b692]">
            {{ itemStore.advertisement.content }}
          </p>
        </div>
      </div>
      <!-- End of Notification -->
      <div>
        <h1
          class="text-[23px] uppercase font-[emoji] border-b ridge border-[#404040] text-[#f1be4c] mb-[13px]"
        >
          Most Popular
        </h1>
        <div
          class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
        >
          <FeaturedCardVue
            as="div"
            v-for="pItem in popularItems.value"
            :item="pItem"
          />
        </div>
      </div>
    </div>
  </section>
</template>
