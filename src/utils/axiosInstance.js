import axios from "axios";
import { useLoaderStore } from "../store/loaderStore";
import { useAuthStore } from "../store/authStore";

const axiosInstance = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
});

// Request Interceptor
axiosInstance.interceptors.request.use((config) => {
    const { setLoading } = useLoaderStore.getState();
    const { accessToken } = useAuthStore.getState();

    // Activate loader
    setLoading(true);

    // Add Authorization header if token is present
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        const { setLoading } = useLoaderStore.getState();

        // Deactivate loader
        setLoading(false);

        return response;
    },
    (error) => {
        const { setLoading } = useLoaderStore.getState();

        // Deactivate loader
        setLoading(false);
        console.log(error);

        return Promise.reject(error);
    }
);

export default axiosInstance;
