<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import useEstate from "@/composables/useEstate";

const route = useRoute();
const tokenId = ref(route.params.id);
const { token, isTokenLoading, isTokenReady } = useEstate(tokenId);

const groupedAttributes = computed(() => {
  return (
    token.value?.metadata?.attributes?.reduce((attributes, attribute) => {
      attributes[attribute.trait_type] = attributes[attribute.trait_type] || [];
      attributes[attribute.trait_type].push(attribute.value);
      return attributes;
    }, {}) ?? []
  );
});
</script>

<template>
  <div class="self-center w-full py-16">
    <div class="container max-w-screen-2xl">
      <div class="grid justify-center gap-24 lg:gap-12 lg:flex">
        <div class="max-w-[600px]">
          <img
            :src="token?.metadata.image"
            class="aspect-square rounded-[60px] w-full"
          />
        </div>
        <div class="grid h-full max-w-screen-sm gap-12">
          <h1 class="font-serif text-5xl font-bold">
            {{ token?.metadata.name }}
          </h1>
          <div class="grid gap-4">
            <div v-for="[key, value] in Object.entries(groupedAttributes)">
              <div class="text-xs text-white/70">
                {{ key }}
              </div>
              <div class="font-semibold">
                {{ value.join(", ") }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
