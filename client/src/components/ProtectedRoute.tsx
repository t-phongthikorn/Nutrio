import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { getAccessToken } from "../api/token";

export default function ProtectedRoute() {
    const { loading } = useAuth();

    if (loading) {
    return <div>Loading...</div>; // หรือ spinner
}

    if (getAccessToken() == null) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}