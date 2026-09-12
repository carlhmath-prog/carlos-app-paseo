import { Navigate, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const getStoredUser = () => {
    if (typeof window === "undefined") return null;

    try {
        return JSON.parse(localStorage.getItem("paseafeliz_user") || "null");
    } catch {
        return null;
    }
};

export const ProtectedRoute = ({ children, allowedRoles = [], redirectTo = "/login" }) => {
    const { store } = useGlobalReducer();
    const location = useLocation();

    const user = store.auth?.user ?? getStoredUser();
    const token = store.auth?.token ?? localStorage.getItem("paseafeliz_token");
    const isAuthenticated = Boolean(user && token);

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/panel" replace />;
    }

    return children;
};

export const PublicOnlyRoute = ({ children, redirectTo = "/panel" }) => {
    const { store } = useGlobalReducer();
    const user = store.auth?.user ?? getStoredUser();
    const token = store.auth?.token ?? localStorage.getItem("paseafeliz_token");

    if (user && token) {
        return <Navigate to={redirectTo} replace />;
    }

    return children;
};
