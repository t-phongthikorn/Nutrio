import { createContext, useContext, useEffect, useState } from "react";
import axios from "../api/axios";
import { getAccessToken, setAccessToken } from "../api/token";

type AuthState = {
  username: string | null;
  loading: boolean;
  isAuthenticated: boolean;
};

type AuthType = AuthState & {
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
};

const AuthContext = createContext<AuthType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({
    username: null,
    loading: true,
    isAuthenticated: false,
  });
  useEffect(() => {
    let isMounted = true;

    const fetchMe = async () => {
      try {
        const response = await axios.get("/api/auth/me");

        if (isMounted && response.data?.username) {
          setAccessToken(response.data.accessToken);

          setAuth({
            username: response.data.username,
            loading: false,
            isAuthenticated: true,
          });
        }
      } catch (err) {
        if (isMounted) {
          setAuth({
            username: null,
            loading: false,
            isAuthenticated: false,
          });
        }
      }
    };

    fetchMe();

    return () => {
      isMounted = false;
    };
  }, []);

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
