import { createContext, useContext, useEffect, useState } from "react";
import axios from "../api/axios";

type AuthType = {
    user: any;
    isAuthenticated: boolean;
    loading: boolean;
    setAuth: React.Dispatch<React.SetStateAction<any>>;
    token: any;
};



const AuthContext = createContext<AuthType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [auth, setAuth] = useState({
        user: null,
        isAuthenticated: false,
        loading: true,
        token: ""
    });
    useEffect(() => {
        const fetchMe = async () => {
            try {
                const response = await axios.get('/api/auth/me');
                console.log(response.data)
                if (response.data) {
                    setAuth({
                        user: null,
                        isAuthenticated: true,
                        loading: false,
                        token: response.data?.acessToken
                    })
                }
            } catch {
                setAuth({
                    user: null,
                    isAuthenticated: false,
                    loading: false,
                    token: ""
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