import { createRouter, createWebHistory } from "vue-router";

import access from "@/middleware/access.js";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Home",
      component: () => import("@/views/Home.vue"),
      meta: {
        access: {
          permissions: ["CHAIN_CORRECT"],
        },
      },
    },
    {
      path: "/featured",
      name: "Featured",
      component: () => import("@/views/Featured.vue"),
      meta: {
        access: {
          permissions: ["CHAIN_CORRECT"],
        },
      },
    },
    {
      path: "/inventory",
      name: "Inventory",
      component: () => import("@/views/Inventory.vue"),
      meta: {
        access: {
          permissions: ["USER", "CHAIN_CORRECT"],
        },
      },
    },
    {
      path: "/items",
      name: "Items",
      component: () => import("@/views/Items.vue"),
      meta: {
        access: {
          permissions: ["CHAIN_CORRECT"],
        },
      },
    },
    {
      path: "/ethereum",
      name: "Network",
      component: () => import("@/views/Network.vue"),
      meta: {
        access: {
          permissions: ["CHAIN_INCORRECT"],
        },
      },
    },
    {
      path: "/estates/:id",
      name: "Token",
      component: () => import("@/views/Token.vue"),
      meta: {
        access: {
          permissions: ["CHAIN_CORRECT"],
        },
      },
    },
  ],
});

router.beforeEach(access);

export default router;
