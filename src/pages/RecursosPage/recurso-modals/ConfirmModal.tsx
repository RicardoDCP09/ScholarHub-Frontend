type Props = {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
};

export default function ConfirmModal({ open, title, description, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar' }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-2">{title || '¿Confirmar?'}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{description}</p>
        <p className="text-xs text-gray-500 mb-4">Nota: si el recurso tiene préstamos asociados no podrá eliminarse.</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 border rounded">{cancelText}</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
