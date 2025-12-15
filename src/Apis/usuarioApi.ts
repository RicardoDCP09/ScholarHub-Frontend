import api from "../utils/axiosInstance"

export interface Usuario {
  id_usuario?: number
  nombre: string
  apellido: string
  correo: string
  rol: 'estudiante' | 'docente' | 'admin' | string
  telefono?: string
  password?: string
  fecha_registro?: string
}

export const createUsuario = async (payload: Partial<Usuario>) => {
  const res = await api.post("/usuarios", payload);
  return res.data;
}

export const getUsuarios = async () => {
  const res = await api.get("/usuarios");
  return res.data;
}

export const getDocentes = async () => {
  const res = await api.get('/usuarios/docentes');
  return res.data;
}

export const getUsuario = async (id: number) => {
  const res = await api.get(`/usuarios/${id}`);
  return res.data;
}

export const updateUsuario = async (id: number, payload: Partial<Usuario>) => {
  const res = await api.put(`/usuarios/${id}`, payload);
  return res.data;
}

export const deleteUsuario = async (id: number) => {
  const res = await api.delete(`/usuarios/${id}`);
  return res.data;
}

export const getEstudiantesDocente = async (docenteId: number) => {
  const res = await api.get(`/usuarios/estudiantes-docente/${docenteId}`);
  return res.data;
}