import { ref, computed, reactive, toRaw } from "vue";
import { defineStore } from "pinia";
import { useShoppingApi } from "@/composables";

const itemStore = defineStore("item", () => {
  const selectedToken = ref(null);

  let advertisement = reactive({
    title: "",
    content: "",
  });

  let itemsBucket = reactive({
    loading: ref(false),
    items: ref([]),
    originItems: ref([]),
  });
  const tileItems = ref([]);
  let associatedItems = ref([]);
  const shoppingApi = useShoppingApi();

  const setSelectedToken = (item) => {
    selectedToken.value = item;
    console.log(selectedToken.value);
  };

  const getItems = async () => {
    try {
      const result = await shoppingApi.get("/items");
      return Promise.resolve(result.data);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const loadItemsBucket = async () => {
    try {
      itemsBucket.loading = true;
      const rawData = await getItems();
      itemsBucket.items = rawData.itemsData;
      itemsBucket.originItems = rawData.itemsData;
      advertisement.title = rawData.advertisement.title;
      advertisement.content = rawData.advertisement.content;
      return Promise.resolve(itemsBucket);
    } catch (err) {
      return Promise.reject(console.error());
    } finally {
      itemsBucket.loading = false;
    }
  };

  const updateItemSoldAmount = (record) => {
    console.log(record);
    console.log(itemsBucket.items);
    const newItemsArr = itemsBucket.items.map((item) => {
      if (item.id === record.id) {
        item.sold_amount = record.sold_amount;
        return item;
      }
      return item;
    });
    console.log(newItemsArr);
    itemsBucket.items = newItemsArr;
  };

  const filterData = ref({});

  const setAssociatedItems = (arr) => {
    associatedItems.value = arr;
  };

  const updateAssociatedItems = (newRecord) => {
    console.log(newRecord);
    associatedItems.value.push(newRecord);
  };

  const loadFilterData = () => {
    shoppingApi
      .get("/customer/load-data")
      .then((res) => {
        filterData.value = res.data;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const selectItem = (id) => {
    console.log(id);
    const selectedItemArr = itemsBucket.originItems.filter(
      (item) => item.id === id
    );

    console.log(selectedItemArr);

    itemsBucket.items = selectedItemArr;
  };

  const filterByText = (text) => {
    const newArray = itemsBucket.originItems.filter(
      (item) => item.name.includes(text) || item.description.includes(text)
    );
    itemsBucket.items = newArray;
  };

  const filterByCheck = (filterData) => {
    if (
      filterData.colorData.length === 0 &&
      filterData.typeData.length === 0 &&
      filterData.rarityData.length === 0
    ) {
      itemsBucket.items = itemsBucket.originItems;
    } else {
      const newArray = itemsBucket.originItems.filter((item) => {
        return (
          filterData.colorData.includes(item.color.id) ||
          filterData.typeData.includes(item.type.id) ||
          filterData.rarityData.includes(item.rarity.id)
        );
      });

      itemsBucket.items = newArray;
    }
  };

  const filterByItems = (type) => {
    console.log(type);
    switch (type) {
      case "all":
        itemsBucket.items = itemsBucket.originItems;
        break;
      case "buy":
        itemsBucket.items = itemsBucket.originItems.filter((item, index) => {
          if (!item.associated_nft_id) {
            return true;
          }
          return false;
        });
        break;
      case "sold":
        itemsBucket.items = itemsBucket.originItems.filter((item, index) => {
          if (item.associated_nft_id) {
            return true;
          }
          return false;
        });
        break;
      default:
        break;
    }
  };

  return {
    selectedToken,
    setSelectedToken,
    itemsBucket,
    associatedItems,
    filterData,
    tileItems,
    advertisement,
    selectItem,
    loadItemsBucket,
    updateItemSoldAmount,
    filterByCheck,
    loadFilterData,
    filterByText,
    filterByItems,
    setAssociatedItems,
    updateAssociatedItems,
  };
});

export default itemStore;
