import { Recurso } from '../RecursosPage';

type Props = {
  open: boolean;
  recurso?: Recurso | null;
  onClose: () => void;
};

export default function ViewRecursoModal({ open, recurso, onClose }: Props) {
  if (!open) return null;
  if (!recurso) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{recurso.nombre}</h3>
          <button onClick={onClose} className="text-gray-600">Cerrar</button>
        </div>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <p><strong>Autor:</strong> {recurso.autor || '-'}</p>
          <p><strong>Tipo:</strong> {recurso.tipo}</p>
          <p><strong>Disponibilidad:</strong> {recurso.disponibilidad ? 'Disponible' : 'No Disponible'}</p>
          <p><strong>Año:</strong> {recurso.anio || '-'}</p>
          <p><strong>Área:</strong> {recurso.area || '-'}</p>
          <p><strong>ISBN/Serie:</strong> {recurso.isbn || recurso.numero_serie || '-'}</p>
          <p><strong>Ubicación:</strong> {recurso.ubicacion_fisica || '-'}</p>
        </div>
      </div>
    </div>
  );
}
