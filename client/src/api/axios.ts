import axios from "axios";
import { getAccessToken, setAccessToken } from "./token";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 วินาที
});

axiosInstance.interceptors.request.use(async (config) => {
  const token = getAccessToken();

  if (config.url?.includes("/api/auth/refresh")) {
    return config;
  }

  if (!(typeof token === "string")) {
    return config;
  }

  const decoded = jwtDecode(token);
  const isExpired = dayjs.unix(decoded.exp as number).diff(dayjs()) < 1;

  if (!isExpired) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {

    const response = await axiosInstance.post("/api/auth/refresh");
    const newToken = response.data.accessToken;
    setAccessToken(newToken);
    config.headers.Authorization = `Bearer ${newToken}`;
  }



  return config;
});

export default axiosInstance;
