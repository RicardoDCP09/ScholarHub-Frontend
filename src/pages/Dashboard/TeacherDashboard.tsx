import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { BoxIconLine, GroupIcon } from "../../icons";
import { FileChartPie } from 'lucide-react';
import { getTeacherDashboard } from '../../Apis/dashboardsApi';
import { listSolicitudesParaTutor, assignTutor, rejectByTeacher } from '../../Apis/investigacionesApi';
import toast from 'react-hot-toast';

export default function TeacherDashboard() {
    type Project = { id: number; name: string; estado: string; deadline: string };

    type TeacherMetricsFlat = {
        tesisACargo?: number;
        students?: number;
        tesisCompletadas?: number;
        projects?: Project[];
    };

    type TeacherMetricsNested = {
        theses?: { count?: number; completed?: number };
        students?: { count?: number };
        projects?: Project[];
    };

    type TeacherMetrics = TeacherMetricsFlat | TeacherMetricsNested | null;

    const [metrics, setMetrics] = useState<TeacherMetrics>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Solicitudes pendientes (declaradas arriba para cumplir reglas de hooks)
    type Solicitud = { id_investigacion?: number; id?: number; titulo?: string; autor_nombre?: string; autor_apellido?: string };
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);

    const { user } = useAuth();
    type U = { id_usuario?: number; id?: number } | null;
    const uu = user as unknown as U;
    const docenteId = uu?.id_usuario ?? uu?.id ?? 0;

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await getTeacherDashboard(Number(docenteId));
                setMetrics(res);
            } catch (err) {
                console.error('Error loading teacher metrics', err);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [docenteId]);

    useEffect(() => {
        const loadSolicitudes = async () => {
            setLoadingSolicitudes(true);
            try {
                const data = await listSolicitudesParaTutor();
                setSolicitudes(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error loading solicitudes', err);
            } finally {
                setLoadingSolicitudes(false);
            }
        };
        void loadSolicitudes();
    }, []);

    // Helper type guards to distinguish response shapes
    const isFlat = (x: TeacherMetrics | null): x is TeacherMetricsFlat => {
        return !!x && (Object.prototype.hasOwnProperty.call(x, 'tesisACargo') || Object.prototype.hasOwnProperty.call(x, 'tesisCompletadas'));
    };

    const isNested = (x: TeacherMetrics | null): x is TeacherMetricsNested => {
        return !!x && Object.prototype.hasOwnProperty.call(x, 'theses');
    };

    const tesisACargo = (() => {
        if (!metrics) return 0;
        if (isFlat(metrics)) return metrics.tesisACargo ?? 0;
        if (isNested(metrics)) return metrics.theses?.count ?? 0;
        return 0;
    })();

    const studentsCount = (() => {
        if (!metrics) return 0;
        if (isFlat(metrics)) return metrics.students ?? 0;
        if (isNested(metrics)) return metrics.students?.count ?? 0;
        return 0;
    })();

    const tesisCompletadas = (() => {
        if (!metrics) return 0;
        if (isFlat(metrics)) return metrics.tesisCompletadas ?? 0;
        if (isNested(metrics)) return metrics.theses?.completed ?? 0;
        return 0;
    })();
    if (loading) return <div className="p-6">Cargando métricas del docente...</div>

    return (
        <>
            <PageMeta
                title="Panel docente | ScholarHub UNET"
                description="Visualiza tus tesis asignadas, estudiantes y solicitudes pendientes en ScholarHub."
            />
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                {/* Primera fila con 3 métricas en la misma línea */}
                <div className="col-span-12">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
                        {/* Tesis a Cargo */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-800/20">
                                <BoxIconLine className="text-blue-600 size-6 dark:text-blue-400" />
                            </div>

                            <div className="flex items-end justify-between mt-5">
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Tesis a Cargo
                                    </span>
                                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                                        {tesisACargo}
                                    </h4>
                                </div>
                            </div>
                        </div>

                        {/* Estudiantes */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-800/20">
                                <GroupIcon className="text-green-600 size-6 dark:text-green-400" />
                            </div>
                            <div className="flex items-end justify-between mt-5">
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Estudiantes
                                    </span>
                                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                                        {studentsCount}
                                    </h4>
                                </div>
                            </div>
                        </div>

                        {/* Tesis Completadas */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl dark:bg-orange-800/20">
                                <FileChartPie className="text-orange-600 size-6 dark:text-orange-400" />
                            </div>
                            <div className="flex items-end justify-between mt-5">
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Tesis Completadas
                                    </span>
                                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                                        {tesisCompletadas}
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>                
                {/* Solicitudes de Tutor */}
                <div className="col-span-12 lg:col-span-12">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 mt-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                            Solicitudes de Tutor
                        </h3>
                        {loadingSolicitudes ? (
                            <div className="p-4">Cargando solicitudes...</div>
                        ) : solicitudes.length === 0 ? (
                            <div className="p-4 text-sm text-gray-500">No hay solicitudes pendientes.</div>
                        ) : (
                            <div className="space-y-3">
                                {solicitudes.map((s) => (
                                    <div key={s.id_investigacion ?? s.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                        <div>
                                            <div className="font-medium">{s.titulo}</div>
                                            <div className="text-sm text-gray-500">Autor: {s.autor_nombre} {s.autor_apellido}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={async () => {
                                                try {
                                                    await assignTutor(String(s.id_investigacion ?? s.id));
                                                    toast.success('Tutor asignado');
                                                    // refrescar
                                                    const data = await listSolicitudesParaTutor();
                                                    setSolicitudes(Array.isArray(data) ? data : []);
                                                } catch (err) {
                                                    console.error(err);
                                                    toast.error('No se pudo asignar');
                                                }
                                            }}>Aceptar</button>
                                            <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={async () => {
                                                try {
                                                    await rejectByTeacher(String(s.id_investigacion ?? s.id));
                                                    toast.success('Solicitud rechazada');
                                                    const data = await listSolicitudesParaTutor();
                                                    setSolicitudes(Array.isArray(data) ? data : []);
                                                } catch (err) {
                                                    console.error(err);
                                                    toast.error('No se pudo rechazar');
                                                }
                                            }}>Rechazar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}