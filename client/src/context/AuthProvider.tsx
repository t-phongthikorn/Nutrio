import { createContext, useContext, useEffect, useState } from "react";
import axios from "../api/axios";
import { getAccessToken, setAccessToken } from "../api/token";

type AuthType = {
    user: any;
    loading: boolean;
    setAuth: React.Dispatch<React.SetStateAction<any>>;
};



const AuthContext = createContext<AuthType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [auth, setAuth] = useState({
        user: null,
        loading: true,
    });
    useEffect(() => {
        const fetchMe = async () => {
            try {
                const response = await axios.get('/api/auth/me');
                console.log(response.data)
                if (response.data) {
                    console.log(response.data)
                    setAccessToken(response.data?.accessToken)
                    setAuth({
                        user: null,
                        loading: false,
                    })
                }
            } catch {
                setAuth({
                    user: null,
                    loading: false,
                });
            }
        }
        fetchMe();
    }, [])

    return (
        <AuthContext.Provider value={{ ...auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

export default AuthContext;