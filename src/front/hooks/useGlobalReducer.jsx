import { createContext, useContext, useReducer } from "react";
import storeReducer, { initialStore } from "../store";

const StoreContext = createContext(null);

const getStoredSession = () => {
    if (typeof window === "undefined") return initialStore();

    const savedUser = localStorage.getItem("paseafeliz_user");
    const savedToken = localStorage.getItem("paseafeliz_token");

    if (!savedUser || !savedToken) return initialStore();

    try {
        const user = JSON.parse(savedUser);
        return {
            ...initialStore(),
            auth: {
                user,
                token: savedToken,
                isAuthenticated: true,
                role: user?.role ?? null,
            },
        };
    } catch {
        return initialStore();
    }
};

export function StoreProvider({ children }) {
    const [store, dispatch] = useReducer(storeReducer, undefined, getStoredSession);

    return (
        <StoreContext.Provider value={{ store, dispatch }}>
            {children}
        </StoreContext.Provider>
    );
}

export default function useGlobalReducer() {
    const context = useContext(StoreContext);

    if (!context) {
        return {
            store: getStoredSession(),
            dispatch: () => { },
        };
    }

    return context;
}