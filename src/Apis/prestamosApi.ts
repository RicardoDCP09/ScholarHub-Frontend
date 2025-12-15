import api from "../utils/axiosInstance"

export type PrestamoEstado = "pendiente" | "activo" | "completado" | "vencido" | "cancelado" | string;


export interface Prestamo {
  id_prestamo: number
  id_usuario: number
  id_recurso: number
  estado: PrestamoEstado
  fecha_prestamo?: string | null
  fecha_devolucion?: string | null
  fecha_inicio?: string
  fecha_fin?: string | null
  usuario?: {
    id_usuario?: number
    nombre?: string
    apellido?: string
    correo?: string
    carrera?: string
    rol?: string
    telefono?: string
  }
  recurso?: {
    id_recurso?: number
    nombre?: string
    tipo?: string
    autor?: string
    disponibilidad?: boolean
  }
}

const pickObject = (raw: unknown): Record<string, unknown> | undefined => {
  if (!raw || typeof raw !== "object") return undefined;
  return raw as Record<string, unknown>;
};

const normalize = (raw: unknown): Prestamo => {
  if (!raw || typeof raw !== "object") {
    throw new Error("Respuesta inválida al normalizar préstamo");
  }

  const r = raw as Record<string, unknown>;
  const usuarioRaw = pickObject(r["usuario"]);
  const recursoRaw = pickObject(r["recurso"]);

  const id_prestamo = Number(r["id_prestamo"] ?? 0);
  const id_usuario = Number(r["id_usuario"] ?? usuarioRaw?.["id_usuario"] ?? 0);
  const id_recurso = Number(r["id_recurso"] ?? recursoRaw?.["id_recurso"] ?? 0);
  const estado = (r["estado"] as PrestamoEstado) ?? "pendiente";
  const fecha_inicio_raw = (r["fecha_inicio"] as string | null) ?? null;
  const fecha_fin_raw = (r["fecha_fin"] as string | null) ?? null;
  const fecha_prestamo = (r["fecha_prestamo"] as string | null) ?? null;
  const fecha_devolucion = (r["fecha_devolucion"] as string | null) ?? null;

  return {
    id_prestamo,
    id_usuario,
    id_recurso,
    estado,
  fecha_prestamo,
  fecha_devolucion,
  fecha_inicio: fecha_inicio_raw ?? fecha_prestamo ?? undefined,
  fecha_fin: fecha_fin_raw ?? fecha_devolucion ?? undefined,
    usuario: usuarioRaw
      ? {
          id_usuario: usuarioRaw["id_usuario"] as number | undefined,
          nombre: usuarioRaw["nombre"] as string | undefined,
          apellido: usuarioRaw["apellido"] as string | undefined,
          correo: usuarioRaw["correo"] as string | undefined,
          carrera: usuarioRaw["carrera"] as string | undefined,
          rol: usuarioRaw["rol"] as string | undefined,
          telefono: usuarioRaw["telefono"] as string | undefined,
        }
      : undefined,
    recurso: recursoRaw
      ? {
          id_recurso: recursoRaw["id_recurso"] as number | undefined,
          nombre: recursoRaw["nombre"] as string | undefined,
          tipo: (recursoRaw["tipo"] as string | undefined)?.toLowerCase(),
          autor: recursoRaw["autor"] as string | undefined,
          disponibilidad: recursoRaw["disponibilidad"] as boolean | undefined,
        }
      : undefined,
  };
};

const normalizeCollection = (data: unknown): Prestamo[] => {
  if (!Array.isArray(data)) return [];
  return data.map(normalize);
};

export const getPrestamos = async (): Promise<Prestamo[]> => {
  const res = await api.get("/prestamos");
  return normalizeCollection(res.data);
}

export const getPrestamo = async (id: number): Promise<Prestamo> => {
  const res = await api.get(`/prestamos/${id}`);
  return normalize(res.data);
}

export const getPrestamosByUsuario = async (id_usuario: number): Promise<Prestamo[]> => {
  const res = await api.get(`/prestamos/usuario/${id_usuario}`);
  return normalizeCollection(res.data);
}

export const createPrestamo = async (payload: {
  id_usuario: number;
  id_recurso: number;
  fecha_prestamo?: string;
  fecha_devolucion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: PrestamoEstado;
}) => {
  const res = await api.post("/prestamos", payload);
  return normalize(res.data);
}

export const updatePrestamo = async (id: number, payload: Partial<Omit<Prestamo, "id_prestamo" | "usuario" | "recurso" | "fecha_inicio" | "fecha_fin">>) => {
  const res = await api.put(`/prestamos/${id}`, payload);
  return normalize(res.data);
}

export const updatePrestamoEstado = async (id: number, estado: PrestamoEstado, extras: { fecha_prestamo?: string; fecha_devolucion?: string | null } = {}) => {
  const res = await api.put(`/prestamos/${id}`, { estado, ...extras });
  return normalize(res.data);
}

export const deletePrestamo = async (id: number) => {
  const res = await api.delete(`/prestamos/${id}`);
  return res.data;
}
