import { useState, useEffect } from 'react';
import PageMeta from "../../components/common/PageMeta";
import { Trash2, Edit, Plus, XCircle } from "lucide-react";
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, Usuario } from '../../Apis/usuarioApi';
import toast from 'react-hot-toast';

export default function UsuariosPage() {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
    const [usuarioEliminar, setUsuarioEliminar] = useState<Usuario | null>(null);
    const [confirmacionTexto, setConfirmacionTexto] = useState('');
    const [loading, setLoading] = useState(false);

    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loadingUsuarios, setLoadingUsuarios] = useState(false);
    const [errorUsuarios, setErrorUsuarios] = useState<string | null>(null);

    const toErrorMessage = (err: unknown) => {
        if (!err) return 'Error desconocido';
        if (typeof err === 'string') return err;
        if (err instanceof Error) return err.message;
        return 'Error desconocido';
    }

    useEffect(() => {
        let mounted = true;
        const fetchUsuarios = async () => {
            setLoadingUsuarios(true);
            try {
                const data = await getUsuarios();
                if (mounted) setUsuarios(Array.isArray(data) ? data : []);
            } catch (err: unknown) {
                console.error('Error fetching usuarios:', err);
                if (mounted) setErrorUsuarios(toErrorMessage(err));
            } finally {
                if (mounted) setLoadingUsuarios(false);
            }
        };
        fetchUsuarios();
        return () => { mounted = false };
    }, []);

    // Handlers para los modales
    const handleAbrirEditar = (usuario: Usuario) => {
        setUsuarioEditando({ ...usuario, password: '' });
        setShowEditModal(true);
    };

    const handleAbrirEliminar = (usuario: Usuario) => {
        setUsuarioEliminar(usuario);
        setShowDeleteModal(true);
        setConfirmacionTexto('');
    };

    const handleGuardarUsuario = async (formData: Partial<Usuario>) => {
        const esNuevo = usuarioEditando?.id_usuario === 0;

        const payload: Partial<Usuario> = {
            ...formData,
            nombre: formData.nombre?.trim() ?? '',
            apellido: formData.apellido?.trim() ?? '',
            correo: formData.correo?.trim() ?? '',
            rol: formData.rol,
            telefono: formData.telefono?.trim() ?? '',
            password: formData.password?.trim(),
        };

        if (!payload.telefono) {
            toast.error('El campo teléfono es obligatorio.');
            return;
        }

        if (esNuevo) {
            if (!payload.password) {
                toast.error('Por favor ingresa una contraseña para el nuevo usuario.');
                return;
            }
        } else if (!payload.password) {
            delete payload.password;
        }

        setLoading(true);
        try {
            if (esNuevo) {
                const created = await createUsuario(payload);
                setUsuarios(prev => [created, ...prev]);
                toast.success('Usuario creado correctamente');
            } else {
                const id = usuarioEditando!.id_usuario as number;
                const updated = await updateUsuario(id, payload);
                setUsuarios(prev => prev.map(u => u.id_usuario === updated.id_usuario ? updated : u));
                toast.success('Usuario actualizado correctamente');
            }
            setShowEditModal(false);
            setUsuarioEditando(null);
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            const serverError = (typeof error === 'object' && error !== null && 'response' in error)
                ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
                : undefined;
            toast.error(serverError ? `Error: ${serverError}` : 'Error al guardar el usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmarEliminacion = async () => {
        if (confirmacionTexto.toLowerCase() !== 'confirmar') {
            toast.error('Por favor escribe "confirmar" para eliminar el usuario');
            return;
        }

        setLoading(true);
        try {
            const id = usuarioEliminar!.id_usuario as number;
            await deleteUsuario(id);
            setUsuarios(prev => prev.filter(u => u.id_usuario !== id));
            toast.success('Usuario eliminado correctamente');
            setShowDeleteModal(false);
            setUsuarioEliminar(null);
            setConfirmacionTexto('');
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            toast.error('Error al eliminar el usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleAbrirCrear = () => {
        // Crear un usuario vacío para el modal de creación
        setUsuarioEditando({
            id_usuario: 0,
            nombre: '',
            apellido: '',
            correo: '',
            rol: 'estudiante',
            telefono: '',
            password: ''
        });
        setShowEditModal(true);
    };

    const cerrarModales = () => {
        setShowEditModal(false);
        setShowDeleteModal(false);
        setUsuarioEditando(null);
        setUsuarioEliminar(null);
        setConfirmacionTexto('');
    };

    // Función para obtener el color según el rol
    const getColorRol = (rol: string) => {
        switch (rol) {
            case 'admin': return 'bg-purple-200 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'docente': return 'bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'estudiante': return 'bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-gray-200 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    // Función para obtener el texto del rol
    const getTextoRol = (rol: string) => {
        switch (rol) {
            case 'admin': return 'Administrador';
            case 'docente': return 'Docente';
            case 'estudiante': return 'Estudiante';
            default: return rol;
        }
    };

    return (
        <>
            <PageMeta
                title="Usuarios del campus | ScholarHub UNET"
                description="Gestiona cuentas de estudiantes, docentes y administradores desde un solo panel."
            />
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <div className="col-span-12 lg:col-span-12">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                Usuarios
                            </h3>
                            <button
                                onClick={handleAbrirCrear}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="size-4" />
                                Añadir Usuario
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <div className="min-w-full">
                                {loadingUsuarios && (
                                    <div className="p-4 text-sm text-gray-600">Cargando usuarios...</div>
                                )}
                                {errorUsuarios && (
                                    <div className="p-4 text-sm text-red-600">{errorUsuarios}</div>
                                )}
                                {/* Header de la tabla */}
                                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2">
                                    <div className="col-span-3 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                        Nombre Completo
                                    </div>
                                    <div className="col-span-3 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                        Correo
                                    </div>
                                    <div className="col-span-2 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                        Rol
                                    </div>
                                    <div className="col-span-2 font-semibold text-sm text-gray-700 dark:text-gray-300 text-right">
                                        Acciones
                                    </div>
                                </div>

                                {/* Filas de la tabla */}
                                <div className="space-y-2">
                                    {usuarios.map((usuario) => (
                                        <div
                                            key={usuario.id_usuario}
                                            className="grid grid-cols-12 gap-4 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className="col-span-3">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {usuario.nombre} {usuario.apellido}
                                                </div>
                                            </div>
                                            <div className="col-span-3">
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {usuario.correo}
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getColorRol(usuario.rol)}`}>
                                                    {getTextoRol(usuario.rol)}
                                                </span>
                                            </div>
                                            <div className="col-end-12 flex justify-end gap-2 ml-20">
                                                <button
                                                    onClick={() => handleAbrirEditar(usuario)}
                                                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                                >
                                                    <Edit className="size-3" />
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleAbrirEliminar(usuario)}
                                                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 text-sm"
                                                >
                                                    <Trash2 className="size-3" />
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Edición/Creación de Usuario */}
            {showEditModal && usuarioEditando && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10">
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {usuarioEditando.id_usuario === 0 ? 'Crear Usuario' : 'Editar Usuario'}
                            </h2>
                            <button
                                onClick={cerrarModales}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <XCircle className="size-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const data = {
                                    nombre: formData.get('nombre') as string,
                                    apellido: formData.get('apellido') as string,
                                    correo: formData.get('correo') as string,
                                    rol: formData.get('rol') as string,
                                    telefono: formData.get('telefono') as string,
                                    password: formData.get('password') as string,
                                };
                                handleGuardarUsuario(data);
                            }} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Nombre *
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            required
                                            defaultValue={usuarioEditando.nombre}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Apellido *
                                        </label>
                                        <input
                                            type="text"
                                            name="apellido"
                                            required
                                            defaultValue={usuarioEditando.apellido}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Correo Electrónico *
                                    </label>
                                    <input
                                        type="email"
                                        name="correo"
                                        required
                                        defaultValue={usuarioEditando.correo}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Rol *
                                    </label>
                                    <select
                                        name="rol"
                                        required
                                        defaultValue={usuarioEditando.rol}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="estudiante">Estudiante</option>
                                        <option value="docente">Docente</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        defaultValue={usuarioEditando.telefono || ''}
                                        placeholder="0412-1234567"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Contraseña *
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        required={usuarioEditando.id_usuario === 0}
                                        placeholder={usuarioEditando.id_usuario === 0 ? "Ingresa una contraseña" : "Deja en blanco para mantener la actual"}
                                        autoComplete="new-password"
                                        defaultValue=""
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {usuarioEditando.id_usuario === 0
                                            ? 'Se utilizará para el primer ingreso del usuario.'
                                            : 'Déjalo en blanco si no deseas modificar la contraseña.'}
                                    </p>
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
                                        {loading ? 'Guardando...' : (usuarioEditando.id_usuario === 0 ? 'Crear Usuario' : 'Guardar Cambios')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Eliminación de Usuario */}
            {showDeleteModal && usuarioEliminar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 bg-opacity-10">
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Eliminar Usuario
                            </h2>
                            <button
                                onClick={cerrarModales}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <XCircle className="size-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="text-center mb-6">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                                    <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    ¿Estás seguro de eliminar este usuario?
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Esta acción no se puede deshacer. Se eliminará permanentemente el usuario:
                                </p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {usuarioEliminar.nombre} {usuarioEliminar.apellido}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {usuarioEliminar.correo}
                                </p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Escribe <span className="font-bold text-red-600">"confirmar"</span> para proceder:
                                </label>
                                <input
                                    type="text"
                                    value={confirmacionTexto}
                                    onChange={(e) => setConfirmacionTexto(e.target.value)}
                                    placeholder="confirmar"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={cerrarModales}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmarEliminacion}
                                    disabled={loading || confirmacionTexto.toLowerCase() !== 'confirmar'}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Eliminando...' : 'Eliminar Usuario'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}