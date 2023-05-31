import useUserStore from "@/stores/user";

const getUserPermissions = () => {
  const permissions = [];
  const userStore = useUserStore();
  userStore.isAuthenticated
    ? permissions.push("USER")
    : permissions.push("GUEST");
  userStore.chainId === import.meta.env.VITE_NETWORK
    ? permissions.push("CHAIN_CORRECT")
    : permissions.push("CHAIN_INCORRECT");
  return permissions;
};

const getUserAccess = () => {
  return {
    permissions: getUserPermissions(),
  };
};

const getRouteAccess = (route) => {
  const permissions = route.meta?.access?.permissions;
  return {
    permissions: permissions ? permissions : [],
  };
};

const routeAccess = (route) => {
  const { permissions } = getUserAccess();
  const access = getRouteAccess(route);

  const result = {
    permissions: {
      accepted: [],
      rejected: [],
    },
  };

  if (access.permissions.length) {
    result.permissions.accepted = access.permissions.filter((permission) =>
      permissions.includes(permission)
    );
    result.permissions.rejected = access.permissions.filter(
      (permission) => !permissions.includes(permission)
    );
  }

  if (result.permissions.rejected.length) {
    if (
      result.permissions.rejected.includes("USER") ||
      result.permissions.rejected.includes("CHAIN_INCORRECT")
    ) {
      return {
        name: "Home",
      };
    }

    if (result.permissions.rejected.includes("CHAIN_CORRECT")) {
      return {
        name: "Network",
      };
    }

    return "/";
  }
};

const access = (to, from, next) => {
  next(routeAccess(to));
};

export default access;
