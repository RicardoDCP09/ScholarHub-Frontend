// ...existing code...
import React, { useState, useEffect, useCallback } from 'react';
import {
    FileText,
    Download,
    Eye,
    Calendar,
    User,
    CheckCircle,
    XCircle,
    Clock,
    Edit,
    Trash2,
    Plus,
    Search,
    AlertCircle,
    BookOpen
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import PageMeta from '../../components/common/PageMeta';
import {
    listInvestigaciones,
    listMisInvestigaciones,
    createInvestigacion,
    updateInvestigacion,
    deleteInvestigacion,
    approveByTeacher,
    approveByAdmin,
    rejectByTeacher,
} from '../../Apis/investigacionesApi';
import { getDocentes, Usuario } from '../../Apis/usuarioApi';
import { requestTutor } from '../../Apis/investigacionesApi';
import toast from 'react-hot-toast';

export interface Tesis {
    id_investigacion: number;
    titulo: string;
    resumen: string;
    anio: number;
    area: string;
    estado: 'pendiente' | 'aprobado_docente' | 'aprobado_admin' | 'rechazado';
    archivo: string;
    id_usuario: number;
    autor?: string;
    carrera?: string;
    tutor?: string;
    fecha_creacion?: string;
    fecha_aprobacion?: string;
    comentarios?: string;
}

const TesisPage: React.FC = () => {
    const { user } = useAuth();
    const userObj = user as unknown as Record<string, unknown> | null;
    const rawRole = userObj?.['rol'] ?? userObj?.['role'] ?? '';
    const role = String(rawRole).toLowerCase(); // 'estudiante' | 'docente' | 'admin'
    const rawId = userObj?.['id_usuario'] ?? userObj?.['id'] ?? userObj?.['idUsuario'] ?? null;
    const userId = rawId !== null && rawId !== undefined ? Number(rawId) : null;


    const [tesis, setTesis] = useState<Tesis[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEstado, setSelectedEstado] = useState<'TODOS' | Tesis['estado']>('TODOS');
    const [showModal, setShowModal] = useState(false);
    const [tesisEditando, setTesisEditando] = useState<Tesis | null>(null);
    const [archivoFile, setArchivoFile] = useState<File | null>(null);
    const [docentes, setDocentes] = useState<Usuario[]>([]);
    const [selectedRequestedTutorId, setSelectedRequestedTutorId] = useState<number | null>(null);
    type Primitive = string | number | boolean | File | undefined | null;


    const estados = ['TODOS', 'pendiente', 'aprobado_docente', 'aprobado_admin', 'rechazado'];

    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showModal]);


    const fetchTesis = useCallback(async () => {
        setLoading(true);
        try {
            const data = role === 'estudiante' ? await listMisInvestigaciones() : await listInvestigaciones();
            setTesis(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('fetchTesis error', error);
        } finally {
            setLoading(false);
        }
    }, [role]);
    useEffect(() => {
        void fetchTesis();
        // cargar lista de docentes
        (async () => {
            try {
                const users = await getDocentes();
                if (Array.isArray(users)) setDocentes(users as Usuario[]);
            } catch (errUnknown) {
                const msg = errUnknown instanceof Error ? errUnknown.message : String(errUnknown);
                console.warn('No se pudieron cargar docentes', msg);
            }
        })();
    }, [userId, role, fetchTesis]); 

    const tesisFiltradas = tesis.filter(tesisItem => {
        const coincideBusqueda = tesisItem.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tesisItem.autor && tesisItem.autor.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (tesisItem.resumen && tesisItem.resumen.toLowerCase().includes(searchTerm.toLowerCase()));

        const coincideEstado = selectedEstado === 'TODOS' || tesisItem.estado === selectedEstado;
        ;

        if (role === 'estudiante') {
            return coincideBusqueda && coincideEstado && tesisItem.id_usuario === userId;
        }

        // Admin y docente ven todas las tesis
        return coincideBusqueda && coincideEstado;
    });

    // Handlers
    const handleDescargarTesis = (tesisItem: Tesis) => {
        if (!tesisItem.archivo) return;
        const apiHost = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '');
        const url = tesisItem.archivo.startsWith('/uploads') ? `${apiHost}${tesisItem.archivo}` : tesisItem.archivo;
        window.open(url, '_blank');
    };

    const handleVerDetalles = (tesisItem: Tesis) => {
        toast.custom(() => (
            <div className="pointer-events-auto w-full max-w-xs rounded-lg bg-white p-4 text-sm text-gray-800 shadow-lg dark:bg-gray-900 dark:text-white">
                <h3 className="font-semibold text-gray-900 dark:text-white">{tesisItem.titulo}</h3>
                <p className="mt-2 text-gray-700 dark:text-gray-200">
                    <span className="font-medium">Autor:</span> {tesisItem.autor ?? 'Sin autor'}
                </p>
                <p className="text-gray-700 dark:text-gray-200">
                    <span className="font-medium">Tutor:</span> {tesisItem.tutor ?? 'Sin tutor'}
                </p>
                <p className="text-gray-700 dark:text-gray-200">
                    <span className="font-medium">Estado:</span> {getTextoEstado(tesisItem.estado)}
                </p>
                {tesisItem.resumen && (
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        {tesisItem.resumen}
                    </p>
                )}
            </div>
        ), { duration: 6000 });
    };

    const handleCambiarEstado = async (tesisItem: Tesis, action: 'aprobar-docente' | 'aprobar-admin' | 'rechazar') => {
        try {
            if (action === 'aprobar-docente') {
                await approveByTeacher(String(tesisItem.id_investigacion));
            } else if (action === 'aprobar-admin') {
                await approveByAdmin(String(tesisItem.id_investigacion));
            } else if (action === 'rechazar') {
                await rejectByTeacher(String(tesisItem.id_investigacion));
            }
            await fetchTesis();
        } catch (errUnknown) {
            console.error('Error cambiar estado', errUnknown);
            const maybeResp = (errUnknown as unknown) as { response?: { data?: { error?: string } } };
            const msg = maybeResp?.response?.data?.error ?? (errUnknown instanceof Error ? errUnknown.message : String(errUnknown)) ?? 'Error al cambiar estado';
            toast.error(msg);
        }
    };

    const handleEliminarTesis = async (tesisItem: Tesis) => {
        if (!confirm(`¿Eliminar la tesis "${tesisItem.titulo}"?`)) return;
        try {
            const res = await deleteInvestigacion(String(tesisItem.id_investigacion));
            toast.success(res?.message || 'Investigación eliminada');
            fetchTesis();
        } catch (errUnknown) {
            console.error('Error eliminar', errUnknown);
            const maybeResp = (errUnknown as unknown) as { response?: { data?: unknown } };
            const resp = maybeResp?.response?.data as unknown | undefined;
            const respObj = resp as { error?: string; prestamos_blocking?: unknown[] } | undefined;
            const msg = respObj?.error ?? (errUnknown instanceof Error ? errUnknown.message : String(errUnknown)) ?? 'No se pudo eliminar';
            // si backend devuelve prestamos_blocking, mostrarlos
            if (respObj?.prestamos_blocking && Array.isArray(respObj.prestamos_blocking)) {
                toast.error(
                    <div className="flex flex-col gap-1">
                        <span>{msg}</span>
                        <span className="font-semibold">Préstamos bloqueantes:</span>
                        <ul className="list-disc pl-5">
                            {(respObj?.prestamos_blocking ?? []).map((p, idx) => {
                                const pp = p as Record<string, unknown>;
                                const prestamoId = pp['id_prestamo'] ?? pp['id'];
                                const usuarioId = pp['id_usuario'] ?? pp['usuario_id'];
                                return <li key={String(prestamoId ?? idx)}>Préstamo {prestamoId as string | number} · Usuario {usuarioId as string | number}</li>;
                            })}
                        </ul>
                    </div>
                );
            } else {
                toast.error(msg);
            }
        }
    };

    // Solicitar tutor para tesis existente (modal por fila)
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestTargetId, setRequestTargetId] = useState<number | null>(null);
    const [requestTutorIdSelected, setRequestTutorIdSelected] = useState<number | null>(null);

    const openRequestModal = (tesisId: number) => {
        setRequestTargetId(tesisId);
        setRequestTutorIdSelected(null);
        setShowRequestModal(true);
    };

    const submitRequestTutor = async () => {
        if (!requestTargetId || !requestTutorIdSelected) {
            toast.error('Selecciona un docente antes de enviar la solicitud');
            return;
        }
        try {
            await requestTutor(String(requestTargetId), requestTutorIdSelected);
            toast.success('Solicitud de tutor enviada');
            setShowRequestModal(false);
            setRequestTargetId(null);
            setRequestTutorIdSelected(null);
            fetchTesis();
        } catch (errUnknown) {
            console.error('Error solicitar tutor', errUnknown);
            toast.error('No se pudo enviar la solicitud');
        }
    };

    const handleCrearTesis = async (tesisData: Partial<Tesis>) => {
        try {
            const payload: Record<string, Primitive> = {
                titulo: tesisData.titulo,
                resumen: tesisData.resumen,
                anio: tesisData.anio,
                area: tesisData.area,
                tutor: tesisData.tutor,
                carrera: tesisData.carrera
            };
            const created = await createInvestigacion(payload, archivoFile || undefined);
            if (selectedRequestedTutorId && created && (created.id_investigacion || created.id)) {
                const newId = created.id_investigacion ?? created.id;
                try {
                    await requestTutor(String(newId), selectedRequestedTutorId);
                } catch (reqErr) {
                    console.warn('No se pudo enviar la solicitud de tutor', reqErr instanceof Error ? reqErr.message : String(reqErr));
                }
            }
            toast.success("Tesis creada");
            setArchivoFile(null);
            setShowModal(false);
            fetchTesis();
        } catch (error) {
            console.error(error);
            toast.error("Error al crear tesis");
        }
    };

    const handleEditarTesis = async (tesisData: Partial<Tesis>) => {
        if (!tesisEditando) return;

        try {
            const payload: Record<string, Primitive> = {
                titulo: tesisData.titulo,
                resumen: tesisData.resumen,
                anio: tesisData.anio,
                area: tesisData.area,
                tutor: tesisData.tutor,
                carrera: tesisData.carrera
            };
            await updateInvestigacion(String(tesisEditando.id_investigacion), payload, archivoFile || undefined);
            toast.success('Tesis actualizada exitosamente');
            setShowModal(false);
            setTesisEditando(null);
            setArchivoFile(null);
            fetchTesis();
        } catch (error) {
            console.error(error);
            toast.error('Error al editar la tesis');
        }
    };

    // Helper functions
    const getColorByEstado = (estado: Tesis['estado']) => {
        switch (estado) {
            case 'aprobado_admin': return 'green';
            case 'aprobado_docente': return 'blue';
            case 'pendiente': return 'yellow';
            case 'rechazado': return 'red';
            default: return 'gray';
        }
    };

    const getIconByEstado = (estado: Tesis['estado']) => {
        switch (estado) {
            case 'aprobado_admin': return CheckCircle;
            case 'aprobado_docente': return CheckCircle;
            case 'pendiente': return Clock;
            case 'rechazado': return XCircle;
            default: return AlertCircle;
        }
    };

    const getTextoEstado = (estado: Tesis['estado']) => {
        switch (estado) {
            case 'aprobado_admin': return 'Aprobado';
            case 'aprobado_docente': return 'Aprobado por Tutor';
            case 'pendiente': return 'En Revisión';
            case 'rechazado': return 'Rechazado';
            default: return estado;
        }
    };

    const puedeEditar = (tesisItem: Tesis) => {
        return role === 'admin' || (role === 'estudiante' && tesisItem.id_usuario === userId && tesisItem.estado === 'pendiente');
    };

    const puedeEliminar = (tesisItem: Tesis) => {
        return role === 'admin' || (role === 'estudiante' && tesisItem.id_usuario === userId);
    };

    return (
        <>
            <PageMeta
                title="Gestión de tesis | ScholarHub UNET"
                description="Administra investigaciones, asigna tutores y da seguimiento al progreso de cada tesis."
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Gestión de Tesis
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {role === 'estudiante'
                                ? `Mis trabajos de grado y tesis (${tesisFiltradas.length})`
                                : 'Sistema de gestión de trabajos de grado'
                            }
                        </p>
                    </div>

                    {/* Acciones por rol */}
                    <div className="flex gap-2">
                        {role === 'estudiante' && (
                            <button
                                onClick={() => {
                                    setTesisEditando(null);
                                    setArchivoFile(null);
                                    setShowModal(true);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Plus className="size-4" />
                                Nueva Tesis
                            </button>
                        )}
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Barra de Búsqueda */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                            <input
                                type="text"
                                placeholder="Buscar por título, autor o resumen..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filtro por Estado */}
                        <select
                            value={selectedEstado}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedEstado(e.target.value as unknown as Tesis['estado'] | 'TODOS')}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {estados.map(estado => (
                                <option key={estado} value={estado}>
                                    {estado === 'TODOS' ? 'Todos los estados' : getTextoEstado(estado as Tesis['estado'])}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {
                    loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 dark:text-gray-400 mt-4">Cargando tesis...</p>
                        </div>
                    ) : (
                        <>
                            {/* Lista de Tesis */}
                            <div className="space-y-4">
                                {tesisFiltradas.map((tesisItem) => {
                                    const EstadoIconComponent = getIconByEstado(tesisItem.estado);
                                    const estadoColor = getColorByEstado(tesisItem.estado);

                                    return (
                                        <div
                                            key={tesisItem.id_investigacion}
                                            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                                        >
                                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                                {/* Información de la Tesis */}
                                                <div className="flex-1">
                                                    <div className="flex items-start gap-4">
                                                        <div className={`p-3 rounded-lg ${estadoColor === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
                                                            estadoColor === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
                                                                estadoColor === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                                                                    'bg-red-100 dark:bg-red-900/20'
                                                            }`}>
                                                            <EstadoIconComponent className={`size-6 ${estadoColor === 'green' ? 'text-green-600 dark:text-green-400' :
                                                                estadoColor === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                                                                    estadoColor === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                                                                        'text-red-600 dark:text-red-400'
                                                                }`} />
                                                        </div>

                                                        <div className="flex-1">
                                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                                                    {tesisItem.titulo}
                                                                </h3>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColor === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                                    estadoColor === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                        estadoColor === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                                    }`}>
                                                                    {getTextoEstado(tesisItem.estado)}
                                                                </span>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                                <div className="space-y-1">
                                                                    {tesisItem.autor && (
                                                                        <div className="flex items-center gap-2">
                                                                            <User className="size-4" />
                                                                            <span>{tesisItem.autor}</span>
                                                                        </div>
                                                                    )}
                                                                    {tesisItem.tutor && (
                                                                        <div className="flex items-center gap-2">
                                                                            <BookOpen className="size-4" />
                                                                            <span>Tutor: {tesisItem.tutor}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <Calendar className="size-4" />
                                                                        <span>Año: {tesisItem.anio}</span>
                                                                    </div>
                                                                    <div className="text-sm">
                                                                        <span className="font-medium">Área:</span> {tesisItem.area}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Resumen */}
                                                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                                                    {tesisItem.resumen}
                                                                </p>
                                                            </div>

                                                            {/* Comentarios si existen */}
                                                            {tesisItem.comentarios && (
                                                                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                                                                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                                                        <span className="font-medium">Comentarios:</span> {tesisItem.comentarios}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Acciones */}
                                                <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                                                    <button
                                                        onClick={() => handleVerDetalles(tesisItem)}
                                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Eye className="size-4" />
                                                        Detalles
                                                    </button>

                                                    {tesisItem.archivo && (
                                                        <button
                                                            onClick={() => handleDescargarTesis(tesisItem)}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Download className="size-4" />
                                                            Descargar
                                                        </button>
                                                    )}

                                                    {/* Acciones de Admin/Docente */}
                                                    {role === 'docente' && tesisItem.estado === 'pendiente' && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleCambiarEstado(tesisItem, 'aprobar-docente')}
                                                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                                            >
                                                                <CheckCircle className="size-4" />
                                                                Aprobar (Tutor)
                                                            </button>
                                                            <button
                                                                onClick={() => handleCambiarEstado(tesisItem, 'rechazar')}
                                                                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                                            >
                                                                <XCircle className="size-4" />
                                                                Rechazar
                                                            </button>
                                                        </div>
                                                    )}

                                                    {role === 'admin' && tesisItem.estado === 'aprobado_docente' && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleCambiarEstado(tesisItem, 'aprobar-admin')}
                                                                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                                            >
                                                                <CheckCircle className="size-4" />
                                                                Aprobar (Admin)
                                                            </button>
                                                        </div>
                                                    )}
                                                    {/* Acciones de Edición/Eliminación */}
                                                    <div className="flex gap-2">
                                                        {puedeEditar(tesisItem) && (
                                                            <button
                                                                onClick={() => {
                                                                    setTesisEditando(tesisItem);
                                                                    setArchivoFile(null);
                                                                    setShowModal(true);
                                                                }}
                                                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                                            >
                                                                <Edit className="size-4" />
                                                                Editar
                                                            </button>
                                                        )}
                                                        {puedeEliminar(tesisItem) && (
                                                            <button
                                                                onClick={() => handleEliminarTesis(tesisItem)}
                                                                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                                            >
                                                                <Trash2 className="size-4" />
                                                                Eliminar
                                                            </button>
                                                        )}
                                                    </div>
                                                    {/* Solicitar tutor - botón visible para el autor si no tiene tutor */}
                                                    {role === 'estudiante' && tesisItem.id_usuario === userId && (
                                                        <div className="mt-2">
                                                            <button
                                                                className="px-3 py-2 bg-indigo-600 text-white rounded-lg"
                                                                onClick={() => openRequestModal(tesisItem.id_investigacion)}
                                                            >
                                                                Solicitar Tutor
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
                            {tesisFiltradas.length === 0 && (
                                <div className="text-center py-12">
                                    <FileText className="mx-auto size-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No se encontraron tesis
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {searchTerm || selectedEstado !== 'TODOS'
                                            ? 'Intenta ajustar los filtros de búsqueda'
                                            : role === 'estudiante'
                                                ? 'No has registrado ninguna tesis aún'
                                                : 'No hay tesis registradas en el sistema'
                                        }
                                    </p>
                                    {role === 'estudiante' && (
                                        <button
                                            onClick={() => setShowModal(true)}
                                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                                        >
                                            <Plus className="size-4" />
                                            Crear mi primera tesis
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )
                }
                {
                    showRequestModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                            <div className="absolute inset-0 bg-black/40" onClick={() => setShowRequestModal(false)} />
                            <div className="relative z-10 bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                                <h3 className="text-lg font-semibold mb-4">Solicitar Tutor</h3>
                                <div className="mb-4">
                                    <label className="block text-sm text-gray-700 mb-2">Selecciona un docente</label>
                                    <select className="w-full p-2 border rounded" value={requestTutorIdSelected ?? ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRequestTutorIdSelected(e.target.value ? Number(e.target.value) : null)}>
                                        <option value="">-- Seleccionar --</option>
                                        {docentes.map((d: Usuario) => (
                                            <option key={d.id_usuario} value={d.id_usuario}>{d.nombre} {d.apellido}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button className="px-4 py-2 border rounded" onClick={() => setShowRequestModal(false)}>Cancelar</button>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={submitRequestTutor}>Enviar solicitud</button>
                                </div>
                            </div>
                        </div>
                    )
                }
                {
                    showModal && (
                        // Estructura corregida que soluciona el problema del fondo
                        <div className="fixed left-0 right-0 top-16 bottom-0 z-50">
                            {/* Overlay transparente */}
                            <div
                                className="absolute inset-0 bg-transparent transition-opacity"
                                onClick={() => {
                                    setShowModal(false);
                                    setTesisEditando(null);
                                    setArchivoFile(null);
                                }}
                            />

                            {/* Contenedor del modal */}
                            <div className="flex items-start justify-center h-full px-4 py-8">
                                <div
                                    className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[80vh] shadow-2xl overflow-hidden"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Header del modal */}
                                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {tesisEditando ? 'Editar Tesis' : 'Nueva Tesis'}
                                        </h2>
                                        <button
                                            onClick={() => {
                                                setShowModal(false);
                                                setTesisEditando(null);
                                                setArchivoFile(null);
                                            }}
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                        >
                                            <XCircle className="size-6" />
                                        </button>
                                    </div>

                                    {/* Contenido desplazable del modal */}
                                    <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 120px)' }}>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.currentTarget);
                                            const data = {
                                                titulo: formData.get('titulo') as string,
                                                resumen: formData.get('resumen') as string,
                                                anio: parseInt(formData.get('anio') as string),
                                                area: formData.get('area') as string,
                                                tutor: formData.get('tutor') as string,
                                                carrera: formData.get('carrera') as string,
                                                archivo: tesisEditando?.archivo || ''
                                            };

                                            if (tesisEditando) {
                                                handleEditarTesis(data);
                                            } else {
                                                handleCrearTesis(data);
                                            }
                                        }} className="space-y-6">
                                            {/* Título */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Título *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="titulo"
                                                    required
                                                    defaultValue={tesisEditando?.titulo || ''}
                                                    placeholder="Ingrese el título de la tesis"
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            {/* Resumen */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Resumen *
                                                </label>
                                                <textarea
                                                    name="resumen"
                                                    required
                                                    rows={4}
                                                    defaultValue={tesisEditando?.resumen || ''}
                                                    placeholder="Describe el resumen de la tesis"
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            {/* Año */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Año *
                                                </label>
                                                <div className="flex gap-4">
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="anio"
                                                            value="2025"
                                                            defaultChecked={!tesisEditando || tesisEditando?.anio === 2025}
                                                            className="mr-2 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-gray-700 dark:text-gray-300">2025</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="anio"
                                                            value="2024"
                                                            defaultChecked={tesisEditando?.anio === 2024}
                                                            className="mr-2 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-gray-700 dark:text-gray-300">2024</span>
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="anio"
                                                            value="2023"
                                                            defaultChecked={tesisEditando?.anio === 2023}
                                                            className="mr-2 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-gray-700 dark:text-gray-300">2023</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Área */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Área *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="area"
                                                    required
                                                    defaultValue={tesisEditando?.area || ''}
                                                    placeholder="Ingrese el área de investigación"
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            {/* Tutor: seleccionar docente y opción para solicitar tutor */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Solicitar Tutor (opcional)
                                                </label>
                                                <select
                                                    name="requested_tutor_id"
                                                    value={selectedRequestedTutorId ?? ''}
                                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedRequestedTutorId(e.target.value ? Number(e.target.value) : null)}
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">-- No solicitar tutor ahora --</option>
                                                    {docentes.map((d: Usuario) => (
                                                        <option key={d.id_usuario} value={d.id_usuario}>
                                                            {d.nombre} {d.apellido}
                                                        </option>
                                                    ))}
                                                </select>
                                                <p className="text-xs text-gray-500 mt-1">Si eliges un docente aquí, se enviará una solicitud de tutor al crear la tesis.</p>
                                            </div>

                                            {/* Carrera */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Carrera *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="carrera"
                                                    required
                                                    defaultValue={tesisEditando?.carrera || ''}
                                                    placeholder="Ingrese la carrera"
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            {/* Archivo PDF */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Archivo PDF
                                                </label>
                                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                                                    <FileText className="mx-auto size-8 text-gray-400 mb-2" />
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                        {tesisEditando ? 'Archivo actual: ' + (tesisEditando.archivo || 'No hay archivo') : 'Arrastra y suelta tu archivo PDF aquí o haz clic para seleccionar'}
                                                    </p>
                                                    <input
                                                        type="file"
                                                        name="archivo"
                                                        accept=".pdf"
                                                        className="hidden"
                                                        id="archivo-input"
                                                        onChange={(e) => {
                                                            const f = e.target.files && e.target.files[0];
                                                            setArchivoFile(f || null);
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor="archivo-input"
                                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                                                    >
                                                        <Plus className="size-4 mr-2" />
                                                        Elegir archivo
                                                    </label>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                        {archivoFile ? archivoFile.name : 'No se ha seleccionado ningún archivo'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Botones de acción */}
                                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowModal(false);
                                                        setTesisEditando(null);
                                                        setArchivoFile(null);
                                                    }}
                                                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    {tesisEditando ? 'Actualizar' : 'Crear'} Tesis
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >
        </>
    );
};

export default TesisPage;