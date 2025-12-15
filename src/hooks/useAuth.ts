import { useState, useEffect } from "react";
import { login as apiLogin, logout as apiLogout } from "../Apis/authApi";

type User = { nombre?: string; correo?: string; rol?: string; id?: number } | null;

export function useAuth() {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const initialUser = storedUser ? (JSON.parse(storedUser) as User) : null;

    const [user, setUser] = useState<User>(initialUser);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem("token"));

    useEffect(() => {
        const onStorage = () => {
            setUser(localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null);
            setIsAuthenticated(!!localStorage.getItem("token"));
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const login = async (correo: string, password: string) => {
        const data = await apiLogin({ correo, password });
        const token = data?.token ?? data?.accessToken ?? data?.data?.token;
        const userData = data?.user ?? data?.data?.user ?? data?.userData ?? null;
        if (!token) throw new Error("Token no recibido");
        localStorage.setItem("token", token);
        if (userData) {
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData as User);
        }
        setIsAuthenticated(true);
        return userData as User;
    };

    const logout = async () => {
        await apiLogout();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
    };

    return { user, login, logout, setUser, isAuthenticated };
}