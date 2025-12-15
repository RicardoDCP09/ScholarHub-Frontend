import api from "../utils/axiosInstance";

export const getInvestigaciones = async () => {
    const res = await api.get("/investigaciones");
    return res.data;
};

export const changeInvestigacionState = async (id: number, action: 'aprobar-docente' | 'aprobar-admin' | 'rechazar') => {
    const res = await api.put(`/investigaciones/${id}/${action}`);
    return res.data;
};

export async function listInvestigaciones(query = "") {
    const res = await api.get(`/investigaciones${query}`);
    return res.data;
}

export async function listMisInvestigaciones() {
    const res = await api.get(`/investigaciones/misinvestigaciones`);
    return res.data;
}

export async function getInvestigacion(id: string) {
    const res = await api.get(`/investigaciones/${id}`);
    return res.data;
}
type Primitive = string | number | boolean | File | undefined | null;
export async function createInvestigacion(payload: Record<string, Primitive>, file?: File) {
    const form = new FormData();
    Object.keys(payload).forEach(k => {
        const v = payload[k];
        if (v !== undefined && v !== null) form.append(k, String(v));
    });
    if (file) form.append("archivo", file);
    const res = await api.post(`/investigaciones`, form);
    return res.data;
}

export async function updateInvestigacion(id: string, payload: Record<string, Primitive>, file?: File) {
    const form = new FormData();
    Object.keys(payload).forEach(k => {
        const v = payload[k];
        if (v !== undefined && v !== null) form.append(k, String(v));
    });
    if (file) form.append("archivo", file);
    const res = await api.put(`/investigaciones/${id}`, form);
    return res.data;
}

export async function approveByTeacher(id: string) {
    const res = await api.put(`/investigaciones/${id}/aprobar-docente`);
    return res.data;
}

export async function rejectByTeacher(id: string, ) {
    const res = await api.put(`/investigaciones/${id}/rechazar`,);
    return res.data;
}

export async function approveByAdmin(id: string) {
    const res = await api.put(`/investigaciones/${id}/aprobar-admin`);
    return res.data;
}

export async function deleteInvestigacion(id: string) {
    const res = await api.delete(`/investigaciones/${id}`);
    return res.data;
}

export async function requestTutor(id: string, requested_tutor_id: number) {
    const res = await api.post(`/investigaciones/${id}/request-tutor`, { requested_tutor_id });
    return res.data;
}

export async function assignTutor(id: string, tutor_id?: number) {
    const res = await api.patch(`/investigaciones/${id}/assign-tutor`, { tutor_id });
    return res.data;
}

export async function listSolicitudesParaTutor() {
    const res = await api.get(`/investigaciones/solicitudes/tutor`);
    return res.data;
}