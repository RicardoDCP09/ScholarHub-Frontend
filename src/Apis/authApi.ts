import api from "../utils/axiosInstance";

export const login = async (payload: { correo: string; password: string }) => {
    const res = await api.post("/auth/login", payload);
    return res.data; // esperar { token, user } o similar
};

export const register = async (payload: { nombre: string; apellido: string; correo: string; password: string; rol: string }) => {
    const res = await api.post("/auth/register", payload);
    return res.data;
};

export const logout = async () => {
    try {
        await api.post("/auth/logout");
    } catch (e) {
        console.log(e)
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};