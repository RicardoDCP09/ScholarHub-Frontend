import React, { useState, useEffect } from 'react';
import PageMeta from "../../components/common/PageMeta";
import {  Edit, Calendar, User, Book, Clock, CheckCircle, X, ThumbsUp, Ban, Eye, FileText } from "lucide-react";
import { getPrestamos, updatePrestamo, updatePrestamoEstado, Prestamo as PrestamoApiType, PrestamoEstado } from '../../Apis/prestamosApi';
import toast from 'react-hot-toast';

// Interfaces basadas en la base de datos

type Prestamo = PrestamoApiType & {
    fecha_inicio?: string;
    fecha_fin?: string;
    estado?: PrestamoEstado;
    usuario?: { nombre?: string; apellido?: string; correo?: string; };
    recurso?: { nombre?: string; tipo?: string; autor?: string };
};

export default function PrestamosPage() {
    const [showEditModal, setShowEditModal] = useState(false);
    const [prestamoEditando, setPrestamoEditando] = useState<Prestamo | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [prestamoDetalle, setPrestamoDetalle] = useState<Prestamo | null>(null);
    const [loading, setLoading] = useState(false);
    const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activo' | 'vencido' | 'completado' | 'pendiente'>('todos');
    const [prestamos, setPrestamos] = useState<Prestamo[]>([]);

    useEffect(() => {
        let mounted = true;
        const fetch = async () => {
            setLoading(true);
            try {
                const data = await getPrestamos();
                let mapped: Prestamo[] = [];
                if (Array.isArray(data)) {
                    mapped = data.map((d: PrestamoApiType) => {
                        const fecha_inicio = d.fecha_inicio ?? d.fecha_prestamo ?? undefined;
                        const fecha_fin = d.fecha_fin ?? d.fecha_devolucion ?? undefined;
                        const usuarioObj = typeof d.usuario === 'string' ? { nombre: d.usuario } : d.usuario;
                        const recursoObj = typeof d.recurso === 'string' ? { nombre: d.recurso } : d.recurso;
                        const estado = d.estado ?? 'pendiente';
                        return {
                            ...d,
                            fecha_inicio,
                            fecha_fin,
                            usuario: usuarioObj,
                            recurso: recursoObj,
                            estado
                        } as Prestamo;
                    });
                }
                if (mounted) setPrestamos(mapped);
            } catch (err) {
                console.error('Error cargando prestamos:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        fetch();
        return () => { mounted = false }
    }, []);

    // Filtrar préstamos según el estado seleccionado
    const prestamosFiltrados = prestamos.filter(prestamo => {
        if (filtroEstado === 'todos') return true;
        return prestamo.estado === filtroEstado;
    });

    // Handlers para los modales
    const handleAbrirEditar = (prestamo: Prestamo) => {
        setPrestamoEditando(prestamo);
        setShowEditModal(true);
    };

    const handleVerDetalle = (prestamo: Prestamo) => {
        setPrestamoDetalle(prestamo);
        setShowDetailModal(true);
    };

    const handleGuardarPrestamo = async (formData: { estado: PrestamoEstado; fecha_fin?: string }) => {
        if (!prestamoEditando) return;
        setLoading(true);
        try {
            const fechaISO = formData.fecha_fin ? new Date(formData.fecha_fin).toISOString() : null;
            const updated = await updatePrestamo(prestamoEditando.id_prestamo!, {
                estado: formData.estado,
                fecha_devolucion: fechaISO ?? undefined,
            });
            setPrestamos(prev => prev.map(p => p.id_prestamo === updated.id_prestamo ? ({ ...p, ...(updated as Partial<Prestamo>) }) : p));
            toast.success('Préstamo actualizado correctamente');
            setShowEditModal(false);
            setPrestamoEditando(null);
        } catch (error) {
            console.error('Error al guardar préstamo:', error);
            toast.error('Error al guardar el préstamo');
        } finally {
            setLoading(false);
        }
    };

    const handleDevolverRecurso = async (prestamo: Prestamo) => {
        setLoading(true);
        try {
            const updated = await updatePrestamoEstado(prestamo.id_prestamo!, 'completado', { fecha_devolucion: new Date().toISOString() });
            setPrestamos(prev => prev.map(p => p.id_prestamo === updated.id_prestamo ? ({ ...p, ...(updated as Partial<Prestamo>) }) : p));
            toast.success('Préstamo marcado como completado');
        } catch (error) {
            console.error('Error al devolver recurso:', error);
            toast.error('Error al completar el préstamo');
        } finally {
            setLoading(false);
        }
    };

    const handleAprobarPrestamo = async (prestamo: Prestamo) => {
        setLoading(true);
        try {
            const updated = await updatePrestamoEstado(prestamo.id_prestamo!, 'activo', { fecha_prestamo: new Date().toISOString() });
            setPrestamos(prev => prev.map(p => p.id_prestamo === updated.id_prestamo ? ({ ...p, ...(updated as Partial<Prestamo>) }) : p));
            toast.success('Préstamo aprobado');
        } catch (error) {
            console.error('Error al aprobar préstamo:', error);
            toast.error('No se pudo aprobar el préstamo');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelarPrestamo = async (prestamo: Prestamo) => {
        setLoading(true);
        try {
            const updated = await updatePrestamoEstado(prestamo.id_prestamo!, 'cancelado');
            setPrestamos(prev => prev.map(p => p.id_prestamo === updated.id_prestamo ? ({ ...p, ...(updated as Partial<Prestamo>) }) : p));
            toast.success('Préstamo cancelado');
        } catch (error) {
            console.error('Error al cancelar préstamo:', error);
            toast.error('No se pudo cancelar el préstamo');
        } finally {
            setLoading(false);
        }
    };

    const cerrarModales = () => {
        setShowEditModal(false);
        setPrestamoEditando(null);
    };

    const cerrarDetalle = () => {
        setShowDetailModal(false);
        setPrestamoDetalle(null);
    };

    // Función para obtener el color según el estado
    const getColorEstado = (estado: string) => {
        switch (estado) {
            case 'activo':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'vencido':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'completado':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'pendiente':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'cancelado':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    // Función para obtener el texto del estado
    const getTextoEstado = (estado: string) => {
        switch (estado) {
            case 'activo': return 'Activo';
            case 'vencido': return 'Vencido';
            case 'completado': return 'Completado';
            case 'pendiente': return 'Pendiente';
            case 'cancelado': return 'Cancelado';
            default: return estado;
        }
    };

    // Función para obtener el icono según el tipo de recurso
    const getIconoTipo = (tipo: string) => {
        switch (tipo.toLowerCase()) {
            case 'libro': return <Book className="size-4" />;
            case 'equipo': return <Clock className="size-4" />;
            case 'investigacion': return <FileText className="size-4" />;
            default: return <Book className="size-4" />;
        }
    };

    // Formatear fecha (acepta undefined)
    const formatFecha = (fecha?: string) => {
        if (!fecha) return 'N/A';
        const parsed = new Date(fecha);
        if (Number.isNaN(parsed.getTime())) return 'N/A';
        return parsed.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const toDateInputValue = (fecha?: string) => {
        if (!fecha) return '';
        const parsed = new Date(fecha);
        if (Number.isNaN(parsed.getTime())) return '';
        return parsed.toISOString().slice(0, 10);
    };

    // Verificar si un préstamo está vencido (acepta undefined)
    const estaVencido = (fechaFin?: string) => {
        if (!fechaFin) return false;
        try {
            return new Date(fechaFin) < new Date();
        } catch {
            return false;
        }
    };

    return (
        <>
            <PageMeta
                title="Gestión de préstamos | ScholarHub UNET"
                description="Administra las solicitudes y préstamos de recursos académicos de toda la comunidad."
            />
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <div className="col-span-12 lg:col-span-12">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                    Gestión de Préstamos
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Administra los préstamos activos, vencidos y completados
                                </p>
                            </div>
                            <div className="flex gap-3">
                                {/* Filtro por estado */}
                                <select
                                    value={filtroEstado}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFiltroEstado(e.target.value as 'todos' | 'activo' | 'vencido' | 'completado' | 'pendiente')}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="todos">Todos los estados</option>
                                    <option value="activo">Activos</option>
                                    <option value="vencido">Vencidos</option>
                                    <option value="completado">Completados</option>
                                    <option value="pendiente">Pendientes</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <div className="min-w-full">
                                {/* Header de la tabla */}
                                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2">
                                    <div className="col-span-3 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                        Usuario / Recurso
                                    </div>
                                    <div className="col-span-2 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                        Fechas
                                    </div>
                                    <div className="col-span-2 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                        Tipo
                                    </div>
                                    <div className="col-span-2 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                        Estado
                                    </div>
                                    <div className="col-span-3 font-semibold text-sm text-gray-700 dark:text-gray-300 text-right">
                                        Acciones
                                    </div>
                                </div>

                                {/* Filas de la tabla */}
                                <div className="space-y-2">
                                    {prestamosFiltrados.map((prestamo) => (
                                        <div
                                            key={prestamo.id_prestamo}
                                            className="grid grid-cols-12 gap-4 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            {/* Usuario y Recurso */}
                                            <div className="col-span-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0">
                                                        <User className="size-8 p-1 bg-blue-100 text-blue-600 rounded-full dark:bg-blue-900/20 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {prestamo.usuario ? `${prestamo.usuario.nombre || ''} ${prestamo.usuario.apellido || ''}`.trim() : 'Usuario desconocido'}
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            {prestamo.recurso?.nombre || 'Recurso desconocido'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-500">
                                                            {prestamo.usuario?.correo || '—'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Fechas */}
                                            <div className="col-span-2">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Calendar className="size-3 text-gray-400" />
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            Inicio: {formatFecha(prestamo.fecha_inicio)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Calendar className="size-3 text-gray-400" />
                                                        <span className={`${estaVencido(prestamo.fecha_fin) && prestamo.estado === 'activo' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                            Fin: {formatFecha(prestamo.fecha_fin)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tipo de Recurso */}
                                            <div className="col-span-2">
                                                <div className="flex items-center gap-2">
                                                    {getIconoTipo(prestamo.recurso?.tipo || 'Libro')}
                                                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                                        {prestamo.recurso?.tipo || 'Libro'}
                                                    </span>
                                                </div>
                                                {prestamo.recurso?.autor && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                        por {prestamo.recurso.autor}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Estado */}
                                            <div className="col-span-2">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getColorEstado(String(prestamo.estado))}`}>
                                                    {getTextoEstado(String(prestamo.estado))}
                                                    {estaVencido(prestamo.fecha_fin) && prestamo.estado === 'activo' && (
                                                        <span className="ml-1">⚠️</span>
                                                    )}
                                                </span>
                                            </div>

                                            {/* Acciones */}
                                            <div className="col-span-3 flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleVerDetalle(prestamo)}
                                                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                                >
                                                    <Eye className="size-3" />
                                                    Detalles
                                                </button>
                                                {prestamo.estado === 'activo' && (
                                                    <button
                                                        onClick={() => handleDevolverRecurso(prestamo)}
                                                        disabled={loading}
                                                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                                                    >
                                                        <CheckCircle className="size-3" />
                                                        Devolver
                                                    </button>
                                                )}
                                                {prestamo.estado === 'pendiente' && (
                                                    <button
                                                        onClick={() => handleAprobarPrestamo(prestamo)}
                                                        disabled={loading}
                                                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                                                    >
                                                        <ThumbsUp className="size-3" />
                                                        Aprobar
                                                    </button>
                                                )}
                                                {prestamo.estado === 'pendiente' && (
                                                    <button
                                                        onClick={() => handleCancelarPrestamo(prestamo)}
                                                        disabled={loading}
                                                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                                                    >
                                                        <Ban className="size-3" />
                                                        Rechazar
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleAbrirEditar(prestamo)}
                                                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                                >
                                                    <Edit className="size-3" />
                                                    Editar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Mensaje si no hay resultados */}
                                {prestamosFiltrados.length === 0 && (
                                    <div className="text-center py-8">
                                        <Calendar className="mx-auto size-12 text-gray-400 mb-3" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No se encontraron préstamos
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {filtroEstado !== 'todos' 
                                                ? `No hay préstamos con estado "${getTextoEstado(filtroEstado)}"`
                                                : 'No hay préstamos registrados'
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Edición de Préstamo */}
            {showEditModal && prestamoEditando && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Editar Préstamo
                            </h2>
                            <button
                                onClick={cerrarModales}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <X className="size-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const estadoRaw = formData.get('estado') as string;
                                const fecha_fin = formData.get('fecha_fin') as string;
                                const allowed = ['activo','vencido','completado','pendiente','cancelado'] as const;
                                const isAllowed = (allowed as readonly string[]).includes(estadoRaw);
                                const estado = isAllowed ? estadoRaw as PrestamoEstado : 'pendiente';
                                const data = {
                                    estado,
                                    fecha_fin
                                };
                                handleGuardarPrestamo(data);
                            }} className="space-y-4">
                                
                                {/* Información del Usuario */}
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Información del Usuario</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <strong>Nombre:</strong> {prestamoEditando.usuario ? `${prestamoEditando.usuario.nombre || ''} ${prestamoEditando.usuario.apellido || ''}`.trim() : 'Usuario desconocido'}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <strong>Correo:</strong> {prestamoEditando.usuario?.correo || '—'}
                                    </p>
                                </div>

                                {/* Información del Recurso */}
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Información del Recurso</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <strong>Nombre:</strong> {prestamoEditando.recurso?.nombre || 'Recurso desconocido'}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <strong>Tipo:</strong> {prestamoEditando.recurso?.tipo || 'Libro'}
                                    </p>
                                    {prestamoEditando.recurso?.autor && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            <strong>Autor:</strong> {prestamoEditando.recurso.autor}
                                        </p>
                                    )}
                                </div>

                                {/* Fechas */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Fecha Inicio
                                        </label>
                                        <input
                                            type="date"
                                            value={toDateInputValue(prestamoEditando.fecha_inicio)}
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Fecha Fin *
                                        </label>
                                        <input
                                            type="date"
                                            name="fecha_fin"
                                            required
                                            defaultValue={toDateInputValue(prestamoEditando.fecha_fin)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Estado */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Estado *
                                    </label>
                                    <select
                                        name="estado"
                                        required
                                        defaultValue={prestamoEditando.estado}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="activo">Activo</option>
                                        <option value="vencido">Vencido</option>
                                        <option value="completado">Completado</option>
                                        <option value="pendiente">Pendiente</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={cerrarModales}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showDetailModal && prestamoDetalle && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={cerrarDetalle}>
                    <div
                        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-white/5">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Detalle del préstamo</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">ID #{prestamoDetalle.id_prestamo}</p>
                            </div>
                            <button onClick={cerrarDetalle} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="space-y-5 px-6 py-5">
                            <section className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.04]">
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                                    <User className="size-4" /> Usuario
                                </h3>
                                <dl className="text-sm text-gray-600 dark:text-gray-300 grid grid-cols-1 gap-y-1">
                                    <div>
                                        <dt className="font-medium">Nombre</dt>
                                        <dd>{prestamoDetalle.usuario ? `${prestamoDetalle.usuario.nombre ?? ''} ${prestamoDetalle.usuario.apellido ?? ''}`.trim() || '—' : '—'}</dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium">Correo</dt>
                                        <dd>{prestamoDetalle.usuario?.correo ?? '—'}</dd>
                                    </div>
                                </dl>
                            </section>

                            <section className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.04]">
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                                    <Book className="size-4" /> Recurso
                                </h3>
                                <dl className="text-sm text-gray-600 dark:text-gray-300 grid grid-cols-1 gap-y-1">
                                    <div>
                                        <dt className="font-medium">Título</dt>
                                        <dd>{prestamoDetalle.recurso?.nombre ?? '—'}</dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium">Tipo</dt>
                                        <dd className="capitalize">{prestamoDetalle.recurso?.tipo ?? '—'}</dd>
                                    </div>
                                    {prestamoDetalle.recurso?.autor && (
                                        <div>
                                            <dt className="font-medium">Autor</dt>
                                            <dd>{prestamoDetalle.recurso.autor}</dd>
                                        </div>
                                    )}
                                </dl>
                            </section>

                            <section className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.04]">
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                                    <Calendar className="size-4" /> Fechas
                                </h3>
                                <dl className="text-sm text-gray-600 dark:text-gray-300 grid grid-cols-1 gap-y-1">
                                    <div>
                                        <dt className="font-medium">Inicio</dt>
                                        <dd>{formatFecha(prestamoDetalle.fecha_inicio)}</dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium">Fin</dt>
                                        <dd>{formatFecha(prestamoDetalle.fecha_fin)}</dd>
                                    </div>
                                </dl>
                            </section>

                            <section className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.04]">
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Estado</h3>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getColorEstado(String(prestamoDetalle.estado))}`}>
                                    {getTextoEstado(String(prestamoDetalle.estado))}
                                </span>
                            </section>
                        </div>

                        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-white/5 text-right">
                            <button
                                onClick={cerrarDetalle}
                                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

