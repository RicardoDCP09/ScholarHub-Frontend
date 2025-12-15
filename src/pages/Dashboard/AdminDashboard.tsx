import PageMeta from "../../components/common/PageMeta";
import { Users, BookOpen, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAdminDashboard } from '../../Apis/dashboardsApi';

export default function AdminDashboard() {
    type MetricsShape = {
        totalUsers?: number;
        roles?: Record<string, number>;
        totalResources?: number;
        availableResources?: number;
        resourcesByStatus?: { available?: number; onLoan?: number; maintenance?: number };
        activeLoans?: number;
        loansDueSoon?: number;
        pendingRequests?: number;
        urgentRequests?: number;
    } | null;

    const [metrics, setMetrics] = useState<MetricsShape>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await getAdminDashboard();
                setMetrics(res);
            } catch (err) {
                console.error('Error loading admin metrics', err);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, []);

    const resourceStats: Array<{ category: string; count: number; percentage: number; color: string }> = (() => {
        const total = (metrics?.totalResources ?? 0) || 1;
        if (metrics) {
            const available = metrics.availableResources ?? 0;
            const onLoan = metrics.activeLoans ?? 0;
            return [
                { category: "Disponibles", count: available, percentage: Math.round((available / total) * 100), color: "bg-green-500" },
                { category: "En préstamo", count: onLoan, percentage: Math.round((onLoan / total) * 100), color: "bg-blue-500" },
            ];
        }
        return [
            { category: "Disponibles", count: 650, percentage: 65, color: "bg-green-500" },
            { category: "En préstamo", count: 280, percentage: 28, color: "bg-blue-500" },
        ];
    })();

    if (loading) {
        return (
            <div className="p-6">Cargando métricas...</div>
        );
    }

    return (
        <>
            <PageMeta
                title="Panel administrativo | ScholarHub UNET"
                description="Supervisa métricas globales de usuarios, recursos y préstamos en ScholarHub."
            />
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                {/* Primera fila con métricas principales */}
                <div className="col-span-12">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
                        {/* Total de Usuarios */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-800/20">
                                    <Users className="text-blue-600 size-6 dark:text-blue-400" />
                                </div>
                            </div>
                            <div className="flex items-end justify-between mt-5">
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Total de Usuarios
                                    </span>
                                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                                        {metrics?.totalUsers ?? 0}
                                    </h4>
                                </div>
                            </div>
                        </div>

                        {/* Total de Recursos */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-800/20">
                                    <BookOpen className="text-green-600 size-6 dark:text-green-400" />
                                </div>
                                </div>
                            <div className="flex items-end justify-between mt-5">
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Total de Recursos
                                    </span>
                                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                                        {metrics?.totalResources ?? 0}
                                    </h4>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Disponibles: {metrics?.availableResources ?? 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Préstamos Activos */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl dark:bg-orange-800/20">
                                    <Upload className="text-orange-600 size-6 dark:text-orange-400" />
                                </div>
                                <div className="text-right">
                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full dark:bg-orange-900/30 dark:text-orange-400">
                                        +5%
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-end justify-between mt-5">
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Préstamos Activos
                                    </span>
                                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                                        {metrics?.activeLoans ?? 0}
                                    </h4>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Vencen: {metrics?.loansDueSoon ?? 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-12">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                            Estado de Recursos
                        </h3>
                        <div className="space-y-4">
                            {resourceStats.map((stat, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">{String(stat.category)}</span>
                                        <span className="font-medium text-gray-800 dark:text-white/90">
                                            {String((stat.count as number) ?? '')} ({String((stat.percentage as number) ?? '')}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                        <div
                                            className={`h-2 rounded-full ${stat.color} transition-all duration-500`}
                                            style={{ width: `${stat.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}