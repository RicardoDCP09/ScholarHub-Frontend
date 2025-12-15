import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from 'react';
import { BoxIconLine, GroupIcon } from "../../icons";
import { useAuth } from '../../hooks/useAuth';
import { getStudentDashboard } from '../../Apis/dashboardsApi';
import { listMisInvestigaciones } from '../../Apis/investigacionesApi';
import {
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    CalendarIcon
} from 'lucide-react';
export default function StudentDashboard() {
    type UserShape = { id_usuario?: number; id?: number } | null;
    const { user } = useAuth();
    const u = user as unknown as UserShape;
    const studentId = u?.id_usuario ?? u?.id ?? 0;
    type StudentMetrics = { activeLoans?: number; projectsInCourse?: number; nextDue?: string } | null;
    const [metrics, setMetrics] = useState<StudentMetrics>(null);
    const [misTesis, setMisTesis] = useState<Array<{ id_investigacion?: number; titulo?: string; estado?: string }>>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await getStudentDashboard(Number(studentId));
                setMetrics(res);
                // load tesis detalladas del estudiante
                try {
                    const tesis = await listMisInvestigaciones();
                    if (Array.isArray(tesis)) setMisTesis(tesis as Array<{ id_investigacion?: number; titulo?: string; estado?: string }>);
                } catch (err) {
                    console.warn('No se pudieron cargar las tesis del estudiante', err);
                }
            } catch (err) {
                console.error('Error loading student dashboard', err);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [studentId]);

    const activeLoansCount = metrics?.activeLoans ?? 0;
    const currentProjectsCount = metrics?.projectsInCourse ?? 0;

    const formatFechaCorta = (valor?: string | null) => {
        if (!valor) return 'N/A';
        const parsed = new Date(valor);
        if (Number.isNaN(parsed.getTime())) return 'N/A';
        return parsed.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const nextDueLabel = formatFechaCorta(metrics?.nextDue ?? undefined);


    type EstadoTesis = 'pendiente' | 'aprobado_docente' | 'aprobado_admin' | 'rechazado' | string;

    const getTextoEstado = (estado: EstadoTesis) => {
        switch (estado) {
            case 'aprobado_admin': return 'Aprobado';
            case 'aprobado_docente': return 'Aprobado por Tutor';
            case 'pendiente': return 'En Revisión';
            case 'rechazado': return 'Rechazado';
            default: return String(estado ?? 'Desconocido');
        }
    };

    const getColorByEstado = (estado: EstadoTesis) => {
            switch (estado) {
                case 'aprobado_admin': return 'green';
                case 'aprobado_docente': return 'blue';
                case 'pendiente': return 'yellow';
                case 'rechazado': return 'red';
                default: return 'gray';
            }
        };
    
        const getIconByEstado = (estado: EstadoTesis) => {
            switch (estado) {
                case 'aprobado_admin': return CheckCircle;
                case 'aprobado_docente': return CheckCircle;
                case 'pendiente': return Clock;
                case 'rechazado': return XCircle;
                default: return AlertCircle;
            }
        };

    if (loading) return <div className="p-6">Cargando dashboard...</div>

    return (
        <>
            <PageMeta
                title="Panel estudiantil | ScholarHub UNET"
                description="Revisa tus préstamos activos, proyectos y próximas entregas dentro de ScholarHub."
            />
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                {/* Primera fila con métricas principales - Siempre 3 en línea */}
                <div className="col-span-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        {/* Préstamos Activos */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-800/20">
                                <BoxIconLine className="text-blue-600 size-6 dark:text-blue-400" />
                            </div>
                            <div className="flex items-end justify-between mt-5">
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Préstamos Activos
                                    </span>
                                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                                        {activeLoansCount}
                                    </h4>
                                </div>
                            </div>
                        </div>

                        {/* Proyectos en Curso */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-800/20">
                                <GroupIcon className="text-green-600 size-6 dark:text-green-400" />
                            </div>
                            <div className="flex items-end justify-between mt-5">
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Proyectos en Curso
                                    </span>
                                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                                        {currentProjectsCount}
                                    </h4>
                                </div>
                            </div>
                        </div>

                        {/* Próximas Entregas */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl dark:bg-orange-800/20">
                                <CalendarIcon className="text-orange-600 size-6 dark:text-orange-400" />
                            </div>
                            <div className="flex items-end justify-between mt-5">
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Próxima Entrega
                                    </span>
                                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                                        {nextDueLabel}
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Segunda fila - Tablas de información */}
                <div className="col-span-12 lg:col-span-6">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                            Préstamos Activos
                        </h3>
                        <div className="overflow-x-auto">
                            {/* Tabla personalizada desde cero */}
                            <div className="min-w-full">
                                {/* Header de la tabla */}
                                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2">
                                    <div className="col-span-5 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                        Libro
                                    </div>
                                    <div className="col-span-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                        Fecha de Devolución
                                    </div>
                                    <div className="col-span-3 font-semibold text-sm text-gray-700 dark:text-gray-300 text-right">
                                        Estado
                                    </div>
                                </div>

                                {/* Filas de la tabla */}
                                <div className="space-y-2">
                                    <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg">
                                        <div className="col-span-5">
                                            <div className="font-medium text-gray-900 dark:text-white">Préstamos activos</div>
                                        </div>
                                        <div className="col-span-4">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Total: {activeLoansCount}</div>
                                        </div>
                                        <div className="col-span-3 flex justify-end">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">{activeLoansCount > 0 ? 'Activo' : 'Sin préstamos'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-6">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                            Mi Tesis
                        </h3>
                        <div className="overflow-x-auto">
                            {/* Tabla personalizada desde cero */}
                            <div className="min-w-full">
                                {/* Header de la tabla */}
                                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2">
                                    <div className="col-span-5 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                        Proyecto
                                    </div>
                                    <div className="col-span-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                        Estado
                                    </div>
                                </div>

                                {/* Filas de la tabla */}
                                <div className="space-y-2">
                                    {misTesis.length === 0 ? (
                                        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg">
                                            <div className="col-span-12 text-sm text-gray-600">No tienes tesis registradas</div>
                                        </div>
                                    ) : (
                                        misTesis.map((t) => (
                                            <div key={t.id_investigacion} className="grid grid-cols-12 gap-4 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg">
                                                <div className="col-span-5">
                                                    <div className="font-medium text-gray-900 dark:text-white">{t.titulo}</div>
                                                </div>
                                                <div className="col-span-4">
                                                    {(() => {
                                                        const estado = (t.estado || 'pendiente') as EstadoTesis;
                                                        const color = getColorByEstado(estado);
                                                        const Icon = getIconByEstado(estado);
                                                        const bgClass = color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                            : color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                            : color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                            : color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-300';

                                                        return (
                                                            <div className="text-sm">
                                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${bgClass}`}>
                                                                    <Icon className="size-4 mr-2" />
                                                                    {getTextoEstado(estado)}
                                                                </span>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </>
    );
}