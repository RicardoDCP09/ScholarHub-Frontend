import React, { useEffect, useState } from 'react';
import { Book, FileText, Cpu, Search, Plus, Download, Edit, Trash2, CheckCircle, XCircle, User, Calendar, MapPin, Eye } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import PageMeta from '../../components/common/PageMeta';
import { getRecursos, toggleDisponibilidadRecurso, createRecurso, updateRecurso, deleteRecurso, Recurso as ApiRecurso } from "../../Apis/recursoApi"
import { createPrestamo } from "../../Apis/prestamosApi";
import api from '../../utils/axiosInstance';
const extractApiError = (error: unknown): string | undefined => {
    if (typeof error !== 'object' || error === null) return undefined;
    if ('response' in error && error.response && typeof error.response === 'object') {
        const response = error.response as { data?: unknown };
        if (response.data && typeof response.data === 'object' && 'error' in response.data) {
            const data = response.data as { error?: unknown };
            if (typeof data.error === 'string') return data.error;
        }
    }
    if ('message' in error && typeof error.message === 'string') {
        return error.message;
    }
    return undefined;
};

const formatDateTimeLocal = (date: Date) => {
    const pad = (value: number) => String(value).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

import ConfirmModal from './recurso-modals/ConfirmModal';
import ViewRecursoModal from './recurso-modals/ViewRecursoModal';
import CreateEditRecursoModal from './recurso-modals/CreateEditRecursoModal';
import toast from 'react-hot-toast';
export interface Recurso {
    id_recurso: number;
    nombre: string;
    tipo: 'Libro' | 'Equipo' | 'Investigacion';
    disponibilidad: boolean;
    autor?: string;
    area?: string;
    anio?: number;
    editorial?: string;
    isbn?: string;
    paginas?: number;
    ubicacion_fisica?: string;
    modelo?: string;
    numero_serie?: string;
    especificaciones?: string;
    tutor?: string;
    carrera?: string;
    archivo_pdf?: string;
    estado_investigacion?: string;
}

type SolicitarPrestamoModalProps = {
    open: boolean;
    recurso: Recurso | null;
    fechaInicio: string;
    fechaFin: string;
    onChange: (field: 'fechaInicio' | 'fechaFin', value: string) => void;
    onClose: () => void;
    onSubmit: () => void;
    submitting: boolean;
    errorMessage?: string | null;
};

const SolicitarPrestamoModal: React.FC<SolicitarPrestamoModalProps> = ({
    open,
    recurso,
    fechaInicio,
    fechaFin,
    onChange,
    onClose,
    onSubmit,
    submitting,
    errorMessage,
}) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Solicitar préstamo</h3>
                    {recurso && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                            Estás solicitando <span className="font-medium">{recurso.nombre}</span>.
                        </p>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Fecha de inicio
                        </label>
                        <input
                            type="datetime-local"
                            value={fechaInicio}
                            onChange={(e) => onChange('fechaInicio', e.target.value)}
                            maxLength={30}
                            max={fechaFin || undefined}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Pre-cargada con tu hora actual, puedes ajustarla si lo necesitas.</p>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Fecha de devolución
                        </label>
                        <input
                            type="datetime-local"
                            value={fechaFin}
                            onChange={(e) => onChange('fechaFin', e.target.value)}
                            min={fechaInicio || undefined}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Selecciona cuándo devolverás el recurso. Debe ser posterior a la fecha de inicio.</p>
                    </div>
                </div>

                {errorMessage && (
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                        {errorMessage}
                    </div>
                )}

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        disabled={submitting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                        disabled={submitting}
                    >
                        {submitting ? 'Enviando...' : 'Confirmar solicitud'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RecursosPage: React.FC = () => {
    const { user } = useAuth();
    const role = user?.rol ?? 'estuadiante';

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTipo, setSelectedTipo] = useState<'TODOS' | 'Libro' | 'Equipo' | 'Investigacion'>('TODOS');
    const [recursos, setRecursos] = useState<Recurso[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
    const [prestamoModalOpen, setPrestamoModalOpen] = useState(false);
    const [recursoSolicitando, setRecursoSolicitando] = useState<Recurso | null>(null);
    const [prestamoFechas, setPrestamoFechas] = useState<{ fechaInicio: string; fechaFin: string }>({ fechaInicio: '', fechaFin: '' });
    const [prestamoError, setPrestamoError] = useState<string | null>(null);
    const [prestamoSubmitting, setPrestamoSubmitting] = useState(false);



    const fetchRecursos = async () => {
        setLoading(true);
        try {
            const data = await getRecursos();
            if (Array.isArray(data)) {
                const normalizeTipo = (t: string | undefined) => {
                    if (!t) return 'Libro';
                    const lower = t.toLowerCase();
                    if (lower === 'libro' || lower === 'libros') return 'Libro';
                    if (lower === 'equipo' || lower === 'equipos') return 'Equipo';
                    if (lower === 'investigacion' || lower === 'investigaciones') return 'Investigacion';
                    // Fallback: capitalize
                    return t.charAt(0).toUpperCase() + t.slice(1);
                };

                const mapped = data.map((d: unknown) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const obj = d as Record<string, any>;
                    return {
                        ...obj,
                        tipo: normalizeTipo(obj.tipo)
                    } as Recurso;
                });
                setRecursos(mapped);
            } else {
                setRecursos([]);
            }
        } catch (err) {
            console.error(err);
            setError('Error al obtener recursos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecursos();
    }, []);

    const recursosFiltrados = recursos.filter(recurso => {
        const coincideBusqueda =
            recurso.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (recurso.autor && recurso.autor.toLowerCase().includes(searchTerm.toLowerCase()));

        const coincideTipo = selectedTipo === 'TODOS' || recurso.tipo === selectedTipo;

        return coincideBusqueda && coincideTipo;
    });

    // Handlers (manteniendo tu lógica)
    const openSolicitarPrestamo = (recurso: Recurso) => {
        if (!recurso.disponibilidad) {
            toast.error('Recurso no disponible para préstamo');
            return;
        }

        const userObj = user as unknown as { id_usuario?: number; id?: number } | undefined;
        const userId = userObj?.id_usuario ?? userObj?.id;
        if (!userId) {
            toast.error('No pudimos identificar tu usuario. Vuelve a iniciar sesión.');
            return;
        }

        const now = new Date();
        const defaultEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        setPrestamoFechas({
            fechaInicio: formatDateTimeLocal(now),
            fechaFin: formatDateTimeLocal(defaultEnd),
        });
        setPrestamoError(null);
        setRecursoSolicitando(recurso);
        setPrestamoModalOpen(true);
    };

    const closePrestamoModal = () => {
        setPrestamoModalOpen(false);
        setRecursoSolicitando(null);
        setPrestamoFechas({ fechaInicio: '', fechaFin: '' });
        setPrestamoError(null);
    };

    const handlePrestamoFieldChange = (field: 'fechaInicio' | 'fechaFin', value: string) => {
        setPrestamoFechas(prev => ({ ...prev, [field]: value }));
        if (prestamoError) setPrestamoError(null);
    };

    const handleConfirmPrestamo = async () => {
        if (!recursoSolicitando) return;

        const { fechaInicio, fechaFin } = prestamoFechas;
        if (!fechaInicio) {
            setPrestamoError('Debes indicar la fecha de inicio del préstamo.');
            return;
        }
        if (!fechaFin) {
            setPrestamoError('Selecciona la fecha estimada de devolución.');
            return;
        }

        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);

        if (Number.isNaN(inicio.getTime())) {
            setPrestamoError('La fecha de inicio no es válida.');
            return;
        }
        if (Number.isNaN(fin.getTime())) {
            setPrestamoError('La fecha de devolución no es válida.');
            return;
        }
        if (fin.getTime() <= inicio.getTime()) {
            setPrestamoError('La fecha de devolución debe ser posterior a la fecha de inicio.');
            return;
        }

        const userObj = user as unknown as { id_usuario?: number; id?: number } | undefined;
        const userId = userObj?.id_usuario ?? userObj?.id;
        if (!userId) {
            toast.error('No pudimos identificar tu usuario. Vuelve a iniciar sesión.');
            return;
        }

        setPrestamoSubmitting(true);
        try {
            await createPrestamo({
                id_recurso: recursoSolicitando.id_recurso,
                id_usuario: userId,
                fecha_inicio: inicio.toISOString(),
                fecha_fin: fin.toISOString(),
            });
            const recursoNombre = recursoSolicitando.nombre;
            closePrestamoModal();
            toast.success(`Solicitud enviada para "${recursoNombre}". Un administrador la revisará pronto.`);
            fetchRecursos();
        } catch (e) {
            console.error(e);
            const message = extractApiError(e) ?? 'No se pudo solicitar el préstamo';
            setPrestamoError(message);
        } finally {
            setPrestamoSubmitting(false);
        }
    };

    const handleDescargarInvestigacion = (recurso: Recurso) => {
        if (recurso.tipo !== 'Investigacion' || !recurso.archivo_pdf) return;
        window.open(recurso.archivo_pdf, '_blank');
    };

    // El borrado ahora se realiza desde el modal de confirmación (handleDeleteConfirmedLocal)

    const handleAprobarInvestigacion = async (recurso: Recurso) => {
        try {
            await api.patch(`/investigaciones/${recurso.id_recurso}/aprobar`);
            toast.success('Investigación aprobada');
            fetchRecursos();
        } catch (e) {
            console.error(e);
            toast.error('No se pudo aprobar la investigación');
        }
    };

    const handleToggle = async (recurso: Recurso) => {
        if (loadingIds.has(recurso.id_recurso)) return;
        // Optimistic update
        setRecursos(prev => prev.map(r => r.id_recurso === recurso.id_recurso ? ({ ...r, disponibilidad: !r.disponibilidad }) : r));
        setLoadingIds(prev => new Set(prev).add(recurso.id_recurso));
        try {
            const updated = await toggleDisponibilidadRecurso(recurso.id_recurso);
            setRecursos(prev => prev.map(r => r.id_recurso === updated.id_recurso ? ({ ...r, ...updated } as Recurso) : r));
            toast.success('Disponibilidad actualizada');
        } catch (err) {
            // revertir: recargar recurso específico o fallback global
            setRecursos(prev => prev.map(r => r.id_recurso === recurso.id_recurso ? ({ ...r, disponibilidad: recurso.disponibilidad }) : r));
            console.error(err);
            toast.error('No se pudo actualizar disponibilidad');
        } finally {
            setLoadingIds(prev => {
                const s = new Set(prev);
                s.delete(recurso.id_recurso);
                return s;
            });
        }
    };

    // Modales state
    const [viewOpen, setViewOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [activeRecurso, setActiveRecurso] = useState<Recurso | null>(null);

    const openView = (recurso: Recurso) => { setActiveRecurso(recurso); setViewOpen(true); };
    const openEdit = (recurso: Recurso) => { setActiveRecurso(recurso); setEditOpen(true); };
    const openCreate = () => { setActiveRecurso(null); setCreateOpen(true); };
    const openConfirm = (recurso: Recurso) => { setActiveRecurso(recurso); setConfirmOpen(true); };

    const handleSave = async (payload: Partial<Recurso> | FormData) => {
        // Si payload incluye id_recurso -> update, si no -> create
        const normalizedObj = { ...payload } as Record<string, unknown>;
        if (normalizedObj.tipo) normalizedObj.tipo = String(normalizedObj.tipo).toLowerCase();
        try {
            if (payload instanceof FormData) {
                // create with formdata
                const created = await createRecurso(payload as FormData);
                setRecursos(prev => [created as Recurso, ...prev]);
                setCreateOpen(false);
                toast.success('Recurso creado');
                return;
            }
            if ((payload as Partial<Recurso>).id_recurso) {
                const id = (payload as Partial<Recurso>).id_recurso as number;
                const updated = await updateRecurso(id, normalizedObj as Partial<ApiRecurso>);
                setRecursos(prev => prev.map(r => r.id_recurso === updated.id_recurso ? ({ ...r, ...updated } as Recurso) : r));
                setEditOpen(false);
                toast.success('Recurso actualizado');
            } else {
                const created = await createRecurso(normalizedObj as Partial<ApiRecurso>);
                setRecursos(prev => [created as Recurso, ...prev]);
                setCreateOpen(false);
                toast.success('Recurso creado');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error al guardar recurso');
        }
    };

    const handleDeleteConfirmedLocal = async () => {
        if (!activeRecurso) return;
        try {
            await deleteRecurso(activeRecurso.id_recurso);
            setRecursos(prev => prev.filter(r => r.id_recurso !== activeRecurso.id_recurso));
            setConfirmOpen(false);
            toast.success('Recurso eliminado');
        } catch (error: unknown) {
            console.error(error);
            const message = extractApiError(error) ?? 'Error al eliminar';
            toast.error(message);
            setConfirmOpen(false);
        }
    };

    // Función para obtener color según tipo
    const getColorByTipo = (tipo: string) => {
        const t = tipo.toLowerCase();
        switch (t) {
            case 'libro': return 'blue';
            case 'investigacion': return 'green';
            case 'equipo': return 'purple';
            default: return 'gray';
        }
    };

    // Función para obtener icono según tipo
    const getIconByTipo = (tipo: string) => {
        const t = tipo.toLowerCase();
        switch (t) {
            case 'libro': return Book;
            case 'investigacion': return FileText;
            case 'equipo': return Cpu;
            default: return FileText;
        }
    };
    return (
        <>
            <PageMeta
                title="Recursos académicos | ScholarHub UNET"
                description="Consulta y administra el catálogo de libros, equipos e investigaciones disponibles para préstamo."
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Recursos Académicos
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Explora nuestro catálogo de libros, equipos e investigaciones
                        </p>
                    </div>

                    {/* Acciones por rol */}
                    <div className="flex gap-2">
                        {role === 'admin' && (
                            <>
                                <button
                                    onClick={() => openCreate()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <Plus className="size-4" />
                                    Agregar Recurso
                                </button>
                            </>
                        )}
                        {role === 'docente' && (
                            <button
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                                onClick={() => toast('Filtrar mis investigaciones (en construcción)')}
                            >
                                <FileText className="size-4" />
                                Mis Investigaciones
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3">{error}</div>
                )}

                {/* Filtros */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Barra de Búsqueda */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                            <input
                                type="text"
                                placeholder="Buscar por título o autor..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filtro por Tipo */}
                        <select
                            value={selectedTipo}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTipo(e.target.value as 'TODOS' | 'Libro' | 'Equipo' | 'Investigacion')}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="TODOS">Todos los tipos</option>
                            <option value="Libro">Libros</option>
                            <option value="Equipo">Equipos</option>
                            <option value="Investigacion">Investigaciones</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 dark:text-gray-400 mt-4">Cargando recursos...</p>
                    </div>
                ) : (
                    <>
                        {/* Grid de Recursos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recursosFiltrados.map((recurso) => {
                                const IconComponent = getIconByTipo(recurso.tipo);
                                const color = getColorByTipo(recurso.tipo);

                                return (
                                    <div
                                        key={recurso.id_recurso}
                                        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                                    >
                                        {/* Header de la Tarjeta */}
                                        <div className={`p-4 border-b ${color === 'blue'
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800'
                                            : color === 'green'
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800'
                                                : 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800'
                                            }`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <IconComponent className={`text-${color}-600 dark:text-${color}-400 size-5`} />
                                                    <span className={`text-sm font-medium text-${color}-600 dark:text-${color}-400`}>
                                                        {recurso.tipo.charAt(0).toUpperCase() + recurso.tipo.slice(1)}
                                                    </span>
                                                </div>
                                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${recurso.disponibilidad
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {recurso.disponibilidad ? 'Disponible' : 'No Disponible'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contenido */}
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2">
                                                {recurso.nombre}
                                            </h3>

                                            <div className="space-y-2 mb-4">
                                                {recurso.autor && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <User className="size-4" />
                                                        <span>{recurso.autor}</span>
                                                    </div>
                                                )}

                                                {recurso.anio && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <Calendar className="size-4" />
                                                        <span>{recurso.anio}</span>
                                                    </div>
                                                )}

                                                {recurso.area && (
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        <span className="font-medium">Área:</span> {recurso.area}
                                                    </div>
                                                )}

                                                {recurso.ubicacion_fisica && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <MapPin className="size-4" />
                                                        <span>{recurso.ubicacion_fisica}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Información Específica */}
                                            {recurso.tipo === 'Investigacion' && recurso.tutor && (
                                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        <span className="font-medium">Tutor:</span> {recurso.tutor}
                                                    </p>
                                                    {recurso.estado_investigacion && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            <span className="font-medium">Estado:</span>
                                                            <span className={`ml-1 px-2 py-1 rounded-full text-xs ${recurso.estado_investigacion === 'aprobado_admin'
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                }`}>
                                                                {recurso.estado_investigacion === 'aprobado_admin' ? 'Aprobado' : 'Pendiente'}
                                                            </span>
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Acciones por Rol */}
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => openView(recurso)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                                >
                                                    <Eye className="size-4" />
                                                    Detalles
                                                </button>

                                                {/* Estudiante */}
                                                {role === 'estudiante' && recurso.disponibilidad && recurso.tipo !== 'Investigacion' && (
                                                    <button
                                                        onClick={() => openSolicitarPrestamo(recurso)}
                                                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                                    >
                                                        <Book className="size-4" />
                                                        Solicitar
                                                    </button>
                                                )}

                                                {role === 'estudiante' && recurso.tipo === 'Investigacion' && recurso.archivo_pdf && (
                                                    <button
                                                        onClick={() => handleDescargarInvestigacion(recurso)}
                                                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                                    >
                                                        <Download className="size-4" />
                                                        Descargar
                                                    </button>
                                                )}

                                                {/* Docente */}
                                                {role === 'docente' && (
                                                    <>
                                                        {recurso.tipo === 'Investigacion' && recurso.estado_investigacion !== 'aprobado_admin' && (
                                                            <button
                                                                onClick={() => handleAprobarInvestigacion(recurso)}
                                                                className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                                            >
                                                                <CheckCircle className="size-4" />
                                                                Revisar
                                                            </button>
                                                        )}
                                                        {recurso.disponibilidad && recurso.tipo !== 'Investigacion' && (
                                                            <button
                                                                onClick={() => openSolicitarPrestamo(recurso)}
                                                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                                            >
                                                                <Book className="size-4" />
                                                                Solicitar
                                                            </button>
                                                        )}
                                                    </>
                                                )}

                                                {/* Admin */}
                                                {role === 'admin' && (
                                                    <div className="flex gap-2 w-full">
                                                        <button
                                                            onClick={() => openEdit(recurso)}
                                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                                        >
                                                            <Edit className="size-4" />
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggle(recurso)}
                                                            disabled={loadingIds.has(recurso.id_recurso)}
                                                            className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                                        >
                                                            {recurso.disponibilidad ? <XCircle className="size-4" /> : <CheckCircle className="size-4" />}
                                                            {loadingIds.has(recurso.id_recurso) ? '...' : recurso.disponibilidad ? 'No Disp.' : 'Disp.'}
                                                        </button>
                                                        <button
                                                            onClick={() => openConfirm(recurso)}
                                                            className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                                        >
                                                            <Trash2 className="size-4" />
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Mensaje si no hay resultados */}
                        {recursosFiltrados.length === 0 && (
                            <div className="text-center py-12">
                                <FileText className="mx-auto size-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No se encontraron recursos
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {searchTerm || selectedTipo !== 'TODOS'
                                        ? 'Intenta ajustar los filtros de búsqueda'
                                        : 'No hay recursos disponibles en este momento'
                                    }
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
            <ViewRecursoModal open={viewOpen} recurso={activeRecurso} onClose={() => setViewOpen(false)} />
            <CreateEditRecursoModal open={createOpen} initial={null} onClose={() => setCreateOpen(false)} onSave={handleSave} />
            <CreateEditRecursoModal open={editOpen} initial={activeRecurso} onClose={() => setEditOpen(false)} onSave={handleSave} />
            <SolicitarPrestamoModal
                open={prestamoModalOpen}
                recurso={recursoSolicitando}
                fechaInicio={prestamoFechas.fechaInicio}
                fechaFin={prestamoFechas.fechaFin}
                onChange={handlePrestamoFieldChange}
                onClose={closePrestamoModal}
                onSubmit={handleConfirmPrestamo}
                submitting={prestamoSubmitting}
                errorMessage={prestamoError}
            />

            <ConfirmModal open={confirmOpen} title={`Eliminar recurso`} description={`¿Seguro que deseas eliminar "${activeRecurso?.nombre}"?`} onConfirm={handleDeleteConfirmedLocal} onCancel={() => setConfirmOpen(false)} confirmText="Eliminar" cancelText="Cancelar" />
        </>
    );
};

export default RecursosPage;