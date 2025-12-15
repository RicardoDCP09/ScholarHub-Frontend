import api from "../utils/axiosInstance"

export interface Recurso {
    id_recurso: number
    nombre: string
    tipo: 'libro' | 'equipo' | 'investigacion'
    disponibilidad: boolean
    autor?: string
    area?: string
    anio?: number
    editorial?: string
    isbn?: string
    paginas?: number
    ubicacion_fisica?: string
    modelo?: string
    numero_serie?: string
    especificaciones?: string
    tutor?: string
    carrera?: string
    archivo_pdf?: string
    estado_investigacion?: string
}

// Listar recursos (opcional: filtros por query)
type RecursoQueryParams = Record<string, string | number | boolean | undefined>;

export const getRecursos = async (params?: RecursoQueryParams): Promise<Recurso[]> => {
    const response = await api.get("/recursos", { params })
    if (!response.data || !Array.isArray(response.data)) {
        throw new Error("No se encontraron recursos")
    }
    return response.data
}

export const getRecurso = async (id: number): Promise<Recurso> => {
    const response = await api.get(`/recursos/${id}`)
    return response.data
}

export const createRecurso = async (payload: Partial<Recurso> | FormData) => {
    // Si envías FormData, axios detecta multipart automáticamente
    const response = await api.post("/recursos", payload)
    return response.data
}

export const updateRecurso = async (id: number, payload: Partial<Recurso> | FormData) => {
    const response = await api.put(`/recursos/${id}`, payload)
    return response.data
}

export const deleteRecurso = async (id: number) => {
    const response = await api.delete(`/recursos/${id}`)
    return response.data
}

export const toggleDisponibilidadRecurso = async (id: number) => {
    const res = await api.patch(`/recursos/${id}/toggle`);
    return res.data;
}