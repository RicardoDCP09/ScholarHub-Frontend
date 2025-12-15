import React, { useState, useEffect, useCallback } from 'react';
import PageMeta from "../../components/common/PageMeta";
import {
    Search,
    Book,
    FileText,
    Download,
    Eye,
    Calendar,
    User,
    Cpu,
    Clock,
    XCircle,
} from 'lucide-react';

import { Prestamo as PrestamoApi, PrestamoEstado, getPrestamosByUsuario, updatePrestamoEstado } from '../../Apis/prestamosApi';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

type ViewPrestamo = {
    id_prestamo?: number;
    fecha_inicio: string;
    fecha_fin: string;
    estado: PrestamoEstado;
    id_usuario?: number;
    id_recurso?: number;
    recurso: { nombre?: string; autor?: string; tipo?: string };
};

const MisPrestamosPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEstado, setSelectedEstado] = useState<'TODOS' | 'activo' | 'completado' | 'vencido' | 'pendiente' | 'cancelado'>('TODOS');
    const [selectedTipo, setSelectedTipo] = useState<'TODOS' | 'libro' | 'equipo' | 'investigacion'>('TODOS');

    const [prestamos, setPrestamos] = useState<ViewPrestamo[]>([]);
    const [loading, setLoading] = useState(false);

    const { user } = useAuth();
    const userShape = user as unknown as { id_usuario?: number; id?: number } | null;
    const usuarioId = userShape?.id_usuario ?? userShape?.id;

    const mapPrestamos = useCallback((data: PrestamoApi[]): ViewPrestamo[] => {
        return data.map((p: PrestamoApi) => {
            const fecha_inicio = p.fecha_inicio ?? p.fecha_prestamo ?? '';
            const fecha_fin = p.fecha_fin ?? p.fecha_devolucion ?? '';
            const recursoNombre = p.recurso?.nombre ?? '';
            return {
                id_prestamo: p.id_prestamo,
                fecha_inicio,
                fecha_fin,
                estado: p.estado ?? 'pendiente',
                id_usuario: p.id_usuario,
                id_recurso: p.id_recurso,
                recurso: {
                    nombre: recursoNombre,
                    tipo: (p.recurso?.tipo ?? '').toLowerCase(),
                    autor: p.recurso?.autor,
                }
            } as ViewPrestamo;
        });
    }, []);

    useEffect(() => {
        let mounted = true;
        const fetch = async () => {
            setLoading(true);
            try {
                if (!usuarioId) {
                    setPrestamos([]);
                    return;
                }
                const data = await getPrestamosByUsuario(Number(usuarioId));
                if (!Array.isArray(data)) return;
                const mapped = mapPrestamos(data);
                if (mounted) setPrestamos(mapped);
            } catch (err) {
                console.error('Error cargando préstamos:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetch();
        return () => { mounted = false };
    }, [mapPrestamos, usuarioId]);

    // Filtros

    const prestamosFiltrados = prestamos.filter(prestamo => {
        const recursoNombre = prestamo.recurso?.nombre ?? '';
        const recursoAutor = prestamo.recurso?.autor ?? '';
        const coincideBusqueda = recursoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (recursoAutor && recursoAutor.toLowerCase().includes(searchTerm.toLowerCase()));

        const coincideEstado = selectedEstado === 'TODOS' || prestamo.estado === selectedEstado;
        const recursoTipo = prestamo.recurso?.tipo ?? '';
        const coincideTipo = selectedTipo === 'TODOS' || recursoTipo === selectedTipo;

        return coincideBusqueda && coincideEstado && coincideTipo;
    });

    // Función para calcular días restantes
    const calcularDiasRestantes = (fechaFin?: string | null): number | null => {
        if (!fechaFin) return null;
        const hoy = new Date();
        const fin = new Date(fechaFin);
        if (Number.isNaN(fin.getTime())) return null;
        const diferencia = fin.getTime() - hoy.getTime();
        return Math.ceil(diferencia / (1000 * 3600 * 24));
    };

    // Función para formatear fecha
    const formatearFecha = (fecha?: string): string => {
        if (!fecha) return 'Por definir';
        const parsed = new Date(fecha);
        if (Number.isNaN(parsed.getTime())) return 'Por definir';
        return parsed.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Función para obtener icono según tipo
    const getIconByTipo = (tipo: string) => {
        switch (tipo) {
            case 'libro': return Book;
            case 'investigacion': return FileText;
            case 'equipo': return Cpu;
            default: return FileText;
        }
    };

    // Función para obtener color según estado
    const getColorByEstado = (estado: string) => {
        switch (estado) {
            case 'activo': return 'green';
            case 'completado': return 'blue';
            case 'vencido': return 'red';
            case 'pendiente': return 'yellow';
            case 'cancelado': return 'gray';
            default: return 'gray';
        }
    };

    // Función para obtener icono según estado
    // getIconByEstado removed (unused)

    // Función para obtener texto según estado
    const getTextByEstado = (estado: string) => {
        switch (estado) {
            case 'activo': return 'Activo';
            case 'completado': return 'Completado';
            case 'vencido': return 'Vencido';
            case 'pendiente': return 'Pendiente';
            case 'cancelado': return 'Cancelado';
            default: return estado;
        }
    };

    // Handlers de acciones
    const refreshPrestamos = async () => {
        if (!usuarioId) return;
        setLoading(true);
        try {
            const data = await getPrestamosByUsuario(Number(usuarioId));
            const mapped = mapPrestamos(data);
            setPrestamos(mapped);
        } catch (err) {
            console.error('Error recargando préstamos:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRenovarPrestamo = async (prestamo: ViewPrestamo) => {
        try {
            await updatePrestamoEstado(prestamo.id_prestamo!, 'activo');
            toast.success('Renovación solicitada. El administrador revisará el cambio.');
            refreshPrestamos();
        } catch (error) {
            console.error('Error al renovar préstamo:', error);
            toast.error('No se pudo solicitar la renovación.');
        }
    };

    const handleDescargarInvestigacion = (prestamo: ViewPrestamo) => {
        if ((prestamo.recurso?.tipo ?? '') === 'investigacion') {
            console.log('Descargar investigación:', prestamo.recurso?.nombre);
            toast('Descargando: ' + (prestamo.recurso?.nombre ?? ''));
        }
    };

    const handleVerDetalles = (prestamo: ViewPrestamo) => {
        console.log('Ver detalles del préstamo:', prestamo);
    };

    const handleCancelarSolicitud = async (prestamo: ViewPrestamo) => {
        try {
            await updatePrestamoEstado(prestamo.id_prestamo!, 'cancelado');
            toast.success('Solicitud cancelada');
            refreshPrestamos();
        } catch (error) {
            console.error('Error al cancelar solicitud:', error);
            toast.error('No se pudo cancelar la solicitud');
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center">
                <PageMeta title="Mis préstamos | ScholarHub UNET" description="Cargando tus préstamos registrados en la plataforma." />
                <div>Cargando préstamos...</div>
            </div>
        )
    }

    return (
        <>
            <PageMeta
                title="Mis préstamos | ScholarHub UNET"
                description="Gestiona y consulta tus préstamos activos, pendientes e históricos."
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Mis Préstamos
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Gestiona y consulta tus préstamos activos e históricos
                        </p>
                    </div>
                </div>

                {/* Filtros Rápidos */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Barra de Búsqueda */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre de recurso o autor..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Filtro por Estado */}
                        <select
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={selectedEstado}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedEstado(e.target.value as 'TODOS' | 'activo' | 'completado' | 'vencido' | 'pendiente' | 'cancelado')}
                        >
                            <option value="TODOS">Todos los estados</option>
                            <option value="activo">Activos</option>
                            <option value="pendiente">Pendientes</option>
                            <option value="completado">Completados</option>
                            <option value="vencido">Vencidos</option>
                            <option value="cancelado">Cancelados</option>
                        </select>

                        {/* Filtro por Tipo */}
                        <select
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={selectedTipo}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTipo(e.target.value as 'TODOS' | 'libro' | 'equipo' | 'investigacion')}
                        >
                            <option value="TODOS">Todos los tipos</option>
                            <option value="libro">Libros</option>
                            <option value="investigacion">Investigaciones</option>
                            <option value="equipo">Equipos</option>
                        </select>
                    </div>
                </div>
                {/* Lista de Préstamos */}
                <div className="space-y-4">
                    {prestamosFiltrados.map((prestamo) => {
                        const IconComponent = getIconByTipo(prestamo.recurso?.tipo ?? '');
                        const estadoColor = getColorByEstado(prestamo.estado as string);
                        const estadoText = getTextByEstado(prestamo.estado as string);
                        const diasRestantes = prestamo.fecha_fin ? calcularDiasRestantes(prestamo.fecha_fin) : null;

                        return (
                            <div
                                key={prestamo.id_prestamo}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    {/* Información del Recurso */}
                                    <div className="flex-1">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-lg ${estadoColor === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
                                                estadoColor === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
                                                    estadoColor === 'red' ? 'bg-red-100 dark:bg-red-900/20' :
                                                        'bg-yellow-100 dark:bg-yellow-900/20'
                                                }`}>
                                                <IconComponent className={`size-6 ${estadoColor === 'green' ? 'text-green-600 dark:text-green-400' :
                                                    estadoColor === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                                                        estadoColor === 'red' ? 'text-red-600 dark:text-red-400' :
                                                            'text-yellow-600 dark:text-yellow-400'
                                                    }`} />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                                        {prestamo.recurso.nombre}
                                                    </h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColor === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                        estadoColor === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                            estadoColor === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        }`}>
                                                        {estadoText}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="space-y-1">
                                                        {prestamo.recurso.autor && (
                                                            <div className="flex items-center gap-2">
                                                                <User className="size-4" />
                                                                <span>{prestamo.recurso.autor}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="size-4" />
                                                            <span>Préstamo: {formatearFecha(prestamo.fecha_inicio)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="size-4" />
                                                            <span>Devolución: {prestamo.fecha_fin ? formatearFecha(prestamo.fecha_fin) : 'Por definir'}</span>
                                                        </div>
                                                            {prestamo.estado === 'activo' && prestamo.fecha_fin && (
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="size-4" />
                                                                    <span className={diasRestantes !== null && diasRestantes < 3 ? 'text-red-600 font-medium' : ''}>
                                                                        {diasRestantes !== null
                                                                            ? diasRestantes > 0
                                                                                ? `${diasRestantes} días restantes`
                                                                                : 'Vence hoy'
                                                                            : 'Sin fecha definida'
                                                                        }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                                        <button
                                            onClick={() => handleVerDetalles(prestamo)}
                                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Eye className="size-4" />
                                            Detalles
                                        </button>

                                        {prestamo.estado === 'pendiente' && (
                                            <button
                                                onClick={() => handleCancelarSolicitud(prestamo)}
                                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <XCircle className="size-4" />
                                                Cancelar
                                            </button>
                                        )}


                                        {prestamo.estado === 'activo' && prestamo.recurso.tipo === 'investigacion' && (
                                            <button
                                                onClick={() => handleDescargarInvestigacion(prestamo)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Download className="size-4" />
                                                Descargar
                                            </button>
                                        )}

                                        {prestamo.estado === 'vencido' && (
                                            <button
                                                onClick={() => handleRenovarPrestamo(prestamo)}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Clock className="size-4" />
                                                Regularizar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Mensaje si no hay resultados */}
                {prestamosFiltrados.length === 0 && (
                    <div className="text-center py-12">
                        <Book className="mx-auto size-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No se encontraron préstamos
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {selectedEstado !== 'TODOS' || selectedTipo !== 'TODOS' || searchTerm
                                ? 'Intenta ajustar los filtros o términos de búsqueda'
                                : 'No tienes préstamos registrados'
                            }
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default MisPrestamosPage;