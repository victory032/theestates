<script setup>
import { toRefs, ref, reactive, toRaw } from "vue";
import useItemStore from "@/stores/item";
const contentLines = ref([]);
const itemStore = useItemStore();
const checkboxFilterData = reactive({
  colorChecked: false,
  typeChecked: false,
  rarityChecked: false,
});

const filterData = reactive({ colorData: [], typeData: [], rarityData: [] });

function addContentLine() {
  contentLines.value.push("Date now is " + Date.now());
}

function removeContentLine() {
  contentLines.value.pop();
}

const filterByText = (eve) => {
  itemStore.filterByText(eve.target.value);
};

const filterBy = (type) => {
  itemStore.filterByItems(type);
};

const onFilterCheckboxChanged = (eve, type, index) => {
  switch (type) {
    case "color":
      const posColorFound = filterData.colorData.indexOf(index);
      if (posColorFound > -1) {
        filterData.colorData.splice(posColorFound, 1);
      } else {
        filterData.colorData.push(index);
      }
      break;
    case "type":
      const posTypeFound = filterData.typeData.indexOf(index);
      if (posTypeFound > -1) {
        filterData.typeData.splice(posTypeFound, 1);
      } else {
        filterData.typeData.push(index);
      }
      break;
    case "rarity":
      const posRarityFound = filterData.rarityData.indexOf(index);
      if (posRarityFound > -1) {
        filterData.rarityData.splice(posRarityFound, 1);
      } else {
        filterData.rarityData.push(index);
      }
      break;
    default:
      break;
  }
  itemStore.filterByCheck(filterData);
};
</script>
<style>
:root {
  --acco-border-radius: 8px;
  --acco-light: transparent;
  --acco-lightest: transparent;
  --acco-dark: #9e9e9e;
  --acco-darkest: rgb(219, 219, 219);
  --acco-active: #ffffff;
}

input[type="radio"] + label span {
  transition: background 0.2s, transform 0.2s;
  border-color: #9f6607;
  color: #8b8b8b;
}

input[type="radio"] + label span:hover,
input[type="radio"] + label:hover span {
  transform: scale(1.1);
  border-color: #9f6607;
}

input[type="radio"]:checked + label span {
  background-color: #9f6607;
  box-shadow: 0px 0px 0px 4px #030e17 inset;
  border-color: #9f6607;
}

input[type="radio"]:checked + label {
  color: #e7e7e7;
}

label {
  color: #c1c1c1;
}

.accordion-list .accordion-item > .accordion-item__summary {
  font-size: 14px;
}

.accordion-list .accordion-item,
.accordion-list .accordion-item--open > .accordion-item__summary {
  border-color: #9f6607;
  border-radius: 0;
}

.accordion-list .accordion-item--open > .accordion-item__summary {
  background-color: #7e55103b;
}

.search-box {
  border-style: ridge;
}
</style>
<template>
  <div class="divide-y divide-gray-700 min-w-[200px]">
    <!-- Radio filter -->
    <div class="flex md:flex-col p-4 md:p-0 gap-2 items-center md:items-start">
      <div class="flex items-center mr-4 mb-0 md:mb-4">
        <input
          id="radio1"
          type="radio"
          name="radio"
          @change="filterBy('all')"
          class="hidden"
          checked
        />
        <label for="radio1" class="flex items-center cursor-pointer">
          <span class="w-4 h-4 inline-block mr-2 border border-grey"></span>
          All</label
        >
      </div>

      <div class="flex items-center mr-4 mb-0 md:mb-4">
        <input
          id="radio2"
          type="radio"
          name="radio"
          class="hidden"
          @change="filterBy('buy')"
        />
        <label for="radio2" class="flex items-center cursor-pointer">
          <span class="w-4 h-4 inline-block mr-2 border border-grey"></span>
          On sale</label
        >
      </div>

      <div class="flex items-center mr-4 mb-0 md:mb-4">
        <input
          id="radio3"
          type="radio"
          name="radio"
          class="hidden"
          @change="filterBy('sold')"
        />
        <label for="radio3" class="flex items-center cursor-pointer">
          <span class="w-4 h-4 inline-block mr-2 border border-grey"></span>
          Sold out</label
        >
      </div>
    </div>
    <!-- Search box -->
    <div class="mt-5">
      <div class="pt-2 relative mx-auto text-gray-600 mt-1 mb-3">
        <input
          class="border-2 border-[#9f6607] bg-[#333] h-10 px-5 w-full text-sm focus:outline-none search-box text-[#eee]"
          type="text"
          name="search"
          placeholder="Search"
          @input="filterByText"
        />
        <button type="button" class="absolute right-0 top-0 mt-5 mr-3">
          <svg
            class="text-gray-600 h-4 w-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            version="1.1"
            id="Capa_1"
            x="0px"
            y="0px"
            viewBox="0 0 56.966 56.966"
            style="enable-background: new 0 0 56.966 56.966"
            xml:space="preserve"
            width="512px"
            height="512px"
          >
            <path
              d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Filter Accordion -->
    <div>
      <AccordionList class="bg-transparent mt-5">
        <AccordionItem id="color-filter">
          <template #summary
            ><h1 class="text-[#e4e4e4] text-[15px] p-0">Color</h1></template
          >
          <div
            v-for="(color, index) in itemStore.filterData.colorData"
            :key="'ColorFilter' + index"
          >
            <input
              type="checkbox"
              name="checkbox-three"
              id="checkbox-three"
              @change="(eve) => onFilterCheckboxChanged(eve, 'color', color.id)"
              class="bg-transparent hover:bg-[#916c1e] cursor-pointer w-5 h-5 border border-[#9f6607] checked:bg-[#9f6607]"
            />
            <label for="checkbox-one" class="ml-3">{{ color.name }}</label>
          </div>
        </AccordionItem>
        <AccordionItem id="type-filter" class="mt-3">
          <template #summary
            ><h1 class="text-[#e4e4e4] text-[15px] p-0">Type</h1></template
          >
          <div
            v-for="(type, index) in itemStore.filterData.typeData"
            :key="'TypeFilter' + index"
          >
            <input
              type="checkbox"
              name="checkbox-three"
              id="checkbox-three"
              @change="(eve) => onFilterCheckboxChanged(eve, 'type', type.id)"
              class="bg-transparent hover:bg-[#916c1e] cursor-pointer w-5 h-5 border border-[#9f6607] checked:bg-[#9f6607]"
            />
            <label for="checkbox-one" class="ml-3">{{ type.name }}</label>
          </div>
        </AccordionItem>
        <AccordionItem id="rarity-filter" class="mt-3">
          <template #summary
            ><h1 class="text-[#e4e4e4] text-[15px] p-0">Rarity</h1></template
          >
          <div
            v-for="(rarity, index) in itemStore.filterData.rarityData"
            :key="'RarityFilter' + index"
          >
            <input
              type="checkbox"
              name="checkbox-three"
              @change="
                (eve) => onFilterCheckboxChanged(eve, 'rarity', rarity.id)
              "
              id="checkbox-three"
              class="bg-transparent hover:bg-[#916c1e] cursor-pointer w-5 h-5 border border-[#9f6607] checked:bg-[#9f6607]"
            />
            <label for="checkbox-one" class="ml-3">{{ rarity.name }}</label>
          </div>
        </AccordionItem>
      </AccordionList>
    </div>
  </div>
</template>
