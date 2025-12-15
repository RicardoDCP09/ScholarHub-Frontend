import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getEstudiantesDocente } from "../../Apis/usuarioApi";
import PageMeta from "../../components/common/PageMeta";
import {
    Search,
    User,
    Mail,
    Library,
    Loader2,
    XCircle,
    AlertTriangle
} from "lucide-react";

interface EstudianteAsignado {
    id_usuario: number;
    nombre: string;
    apellido: string;
    correo: string;
    rol?: string;
    fecha_registro?: string;
    id_investigacion?: number;
    titulo_investigacion?: string;
    anio?: number | null;
    estado?: string | null;
}

const formatFecha = (fecha?: string | null) => {
    if (!fecha) return "-";
    const parsed = new Date(fecha);
    if (Number.isNaN(parsed.getTime())) return "-";
    return new Intl.DateTimeFormat("es-VE", {
        year: "numeric",
        month: "long",
        day: "2-digit"
    }).format(parsed);
};

export default function EstudentsPage() {
    const { user } = useAuth();
    type UserShape = { id_usuario?: number; id?: number; rol?: string } | null;
    const u = user as UserShape;
    const docenteId = u?.id_usuario ?? u?.id;
    const rol = u?.rol ?? "docente";
    const isDocente = (rol ?? "").toLowerCase() === "docente";

    const [estudiantes, setEstudiantes] = useState<EstudianteAsignado[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchEstudiantes = useCallback(async () => {
        if (!docenteId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getEstudiantesDocente(Number(docenteId));
            setEstudiantes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error al obtener estudiantes del docente:", err);
            setError("No pudimos obtener el listado de estudiantes. Intenta nuevamente más tarde.");
            setEstudiantes([]);
        } finally {
            setLoading(false);
        }
    }, [docenteId]);

    useEffect(() => {
        if (!isDocente) return;
        if (!docenteId) return;
        fetchEstudiantes();
    }, [docenteId, isDocente, fetchEstudiantes]);

    const estudiantesFiltrados = useMemo(() => {
        if (!searchTerm.trim()) return estudiantes;
        const term = searchTerm.toLowerCase();
        return estudiantes.filter((est) =>
            `${est.nombre} ${est.apellido}`.toLowerCase().includes(term) ||
            est.correo.toLowerCase().includes(term) ||
            (est.titulo_investigacion ?? "").toLowerCase().includes(term)
        );
    }, [estudiantes, searchTerm]);

    if (!isDocente) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <XCircle className="mx-auto h-12 w-12 text-red-400" />
                    <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Acceso denegado</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Solo los docentes pueden ver esta página.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title="Mis estudiantes | ScholarHub UNET"
                description="Consulta y gestiona los estudiantes asignados a tu tutoría dentro de ScholarHub."
            />
            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis estudiantes</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Estudiantes asignados a tu tutoría ({estudiantesFiltrados.length})
                        </p>
                    </div>
                    <button
                        onClick={fetchEstudiantes}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        <Loader2 className={`h-4 w-4 ${loading ? "animate-spin" : "hidden"}`} />
                        {loading ? "Actualizando..." : "Actualizar listado"}
                    </button>
                </div>

                <div className="bg-white p-4 shadow-sm dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Buscar por nombre, correo o investigación"
                            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            disabled={loading || !!error}
                        />
                    </div>
                </div>

                {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-700/40 dark:bg-red-900/20 dark:text-red-300">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">No pudimos cargar tus estudiantes.</p>
                                <p className="text-sm opacity-80">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white shadow-sm dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {loading ? (
                        <div className="py-16 text-center">
                            <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />
                            <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando estudiantes...</p>
                        </div>
                    ) : estudiantesFiltrados.length === 0 ? (
                        <div className="py-16 text-center">
                            <Library className="mx-auto h-12 w-12 text-gray-400" />
                            <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                                Aún no tienes estudiantes asignados
                            </h2>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Cuando las coordinaciones te asignen tutorías, aparecerán listadas aquí automáticamente.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                            Estudiante
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                            Contacto
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                            Investigación asignada
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                            Desde
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                    {estudiantesFiltrados.map((estudiante) => (
                                        <tr key={estudiante.id_usuario} className="hover:bg-gray-50 dark:hover:bg-gray-700/60">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {estudiante.nombre} {estudiante.apellido}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            ID #{estudiante.id_usuario}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                    <span>{estudiante.correo}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {estudiante.titulo_investigacion ?? "Sin investigación asignada"}
                                                </div>
                                                {estudiante.anio && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Año: {estudiante.anio}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                {estudiante.estado ? estudiante.estado.toUpperCase() : "-"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                {formatFecha(estudiante.fecha_registro)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
