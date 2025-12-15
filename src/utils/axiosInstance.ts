import axios, { AxiosHeaders, type AxiosRequestConfig } from "axios";

const API_HOST = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
// baseURL sin doble slash, incluye /api explícitamente
const API_URL = `${API_HOST.replace(/\/+$/, "")}/api`;

const api = axios.create({
    baseURL: API_URL,
});

const ensureHeaders = (config: AxiosRequestConfig): AxiosRequestConfig["headers"] => {
    if (!config.headers) {
        config.headers = {};
    }
    return config.headers;
};

const setHeader = (headers: AxiosRequestConfig["headers"], key: string, value: string) => {
    if (!headers) return;
    if (headers instanceof AxiosHeaders) {
        headers.set(key, value);
    } else if (typeof headers === "object") {
        (headers as Record<string, string | undefined>)[key] = value;
    }
};

const deleteHeader = (headers: AxiosRequestConfig["headers"], key: string) => {
    if (!headers) return;
    if (headers instanceof AxiosHeaders) {
        headers.delete(key);
    } else if (typeof headers === "object") {
        delete (headers as Record<string, unknown>)[key];
    }
};

api.interceptors.request.use((config) => {
    try {
        const headers = ensureHeaders(config);

        const token = localStorage.getItem("token");
        if (token) {
            setHeader(headers, "Authorization", `Bearer ${token}`);
        }

        if (config.data instanceof FormData) {
            deleteHeader(headers, "Content-Type");
            deleteHeader(headers, "content-type");
        }
    } catch (error) {
        console.error("axios interceptor error:", error);
    }
    return config;
}, (error) => Promise.reject(error));

export default api;