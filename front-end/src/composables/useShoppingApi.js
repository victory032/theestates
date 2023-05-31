import axios from "axios";

const apiShopping = axios.create({
  baseURL: import.meta.env.VITE_SHOPPING_API_URL,
});

export default () => apiShopping;
