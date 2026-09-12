export const initialStore = () => ({
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    role: null,
  },
  walkers: [],
  reservations: [],
  services: [],
  zones: [],
  petTypes: [],
  ui: {
    loading: false,
    error: null,
  },
});

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_loading":
      return {
        ...store,
        ui: {
          ...store.ui,
          loading: Boolean(action.payload),
        },
      };

    case "set_error":
      return {
        ...store,
        ui: {
          ...store.ui,
          error: action.payload ?? null,
        },
      };

    case "clear_error":
      return {
        ...store,
        ui: {
          ...store.ui,
          error: null,
        },
      };

    case "login_success":
      return {
        ...store,
        auth: {
          user: action.payload?.user ?? null,
          token: action.payload?.token ?? null,
          isAuthenticated: true,
          role: action.payload?.user?.role ?? null,
        },
        ui: {
          ...store.ui,
          loading: false,
          error: null,
        },
      };

    case "logout":
      return {
        ...store,
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          role: null,
        },
        ui: {
          ...store.ui,
          loading: false,
          error: null,
        },
      };

    case "set_services":
      return {
        ...store,
        services: action.payload ?? [],
      };

    case "set_zones":
      return {
        ...store,
        zones: action.payload ?? [],
      };

    case "set_pet_types":
      return {
        ...store,
        petTypes: action.payload ?? [],
      };

    case "set_walkers":
      return {
        ...store,
        walkers: action.payload ?? [],
      };

    case "set_reservations":
      return {
        ...store,
        reservations: action.payload ?? [],
      };

    default:
      throw Error(`Unknown action: ${action.type}`);
  }
}
