import React, { useState, useEffect } from 'react';
import { Recurso } from '../RecursosPage';
import toast from 'react-hot-toast';

type Props = {
  open: boolean;
  initial?: Recurso | null;
  onClose: () => void;
  onSave: (payload: Partial<Recurso> | FormData) => Promise<void>;
};

export default function CreateEditRecursoModal({ open, initial, onClose, onSave }: Props) {
  const [loading, setLoading] = useState(false);
  type FormShape = Omit<Partial<Recurso>, 'archivo_pdf'> & { archivo_pdf?: File | string | undefined };
  const [form, setForm] = useState<FormShape>({ tipo: 'Libro', disponibilidad: true });

  useEffect(() => {
    if (initial) {
      const tipoRaw = initial.tipo;
      const tipoCap = tipoRaw
        ? String(tipoRaw).charAt(0).toUpperCase() + String(tipoRaw).slice(1)
        : 'Libro';
      setForm({
        ...initial,
        tipo: tipoCap as FormShape['tipo'],
        archivo_pdf: initial.archivo_pdf ?? undefined,
      });
    } else {
      setForm({ tipo: 'Libro', disponibilidad: true });
    }
  }, [initial]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Validación mínima
    if (!form.nombre || String(form.nombre).trim().length === 0) {
      toast.error('El nombre del recurso es obligatorio');
      setLoading(false);
      return;
    }
    const { archivo_pdf, ...rest } = form;
    const preparedForm: Record<string, unknown> = { ...form };

    const tipoNormalizado = String(preparedForm.tipo ?? 'Libro').toLowerCase();
    preparedForm.tipo = tipoNormalizado;
    let payload: Partial<Recurso> | FormData = { ...rest, tipo: tipoNormalizado } as Partial<Recurso>;
    const posibleArchivo = archivo_pdf;
    if (posibleArchivo && typeof posibleArchivo !== 'string') {
      const file = posibleArchivo;
      if (file instanceof File) {
        const fd = new FormData();
        Object.entries({ ...rest, tipo: tipoNormalizado }).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          fd.append(k, String(v));
        });
        fd.append('archivo_pdf', file);
        payload = fd;
      }
    }
    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[70vh] overflow-auto"><h3 className="text-lg font-bold mb-4">{initial ? 'Editar Recurso' : 'Crear Recurso'}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="w-full px-3 py-2 border rounded" placeholder="Nombre" value={form.nombre || ''} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
          <input className="w-full px-3 py-2 border rounded" placeholder="Autor" value={form.autor || ''} onChange={e => setForm(f => ({ ...f, autor: e.target.value }))} />
          <select value={form.tipo || 'Libro'} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as 'Libro' | 'Equipo' | 'Investigacion' }))} className="w-full px-3 py-2 border rounded">
            <option value="Libro">Libro</option>
            <option value="Equipo">Equipo</option>
            <option value="Investigacion">Investigacion</option>
          </select>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input className="w-full px-3 py-2 border rounded" placeholder="Área" value={form.area || ''} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} />
            <input className="w-full px-3 py-2 border rounded" placeholder="Año" type="number" value={form.anio || ''} onChange={e => setForm(f => ({ ...f, anio: e.target.value ? Number(e.target.value) : undefined }))} />
            <input className="w-full px-3 py-2 border rounded" placeholder="Editorial" value={form.editorial || ''} onChange={e => setForm(f => ({ ...f, editorial: e.target.value }))} />
            <input className="w-full px-3 py-2 border rounded" placeholder="ISBN" value={form.isbn || ''} onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))} />
            <input className="w-full px-3 py-2 border rounded" placeholder="Páginas" type="number" value={form.paginas || ''} onChange={e => setForm(f => ({ ...f, paginas: e.target.value ? Number(e.target.value) : undefined }))} />
            <input className="w-full px-3 py-2 border rounded" placeholder="Ubicación Física" value={form.ubicacion_fisica || ''} onChange={e => setForm(f => ({ ...f, ubicacion_fisica: e.target.value }))} />
            <input className="w-full px-3 py-2 border rounded" placeholder="Modelo" value={form.modelo || ''} onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))} />
            <input className="w-full px-3 py-2 border rounded" placeholder="Número de Serie" value={form.numero_serie || ''} onChange={e => setForm(f => ({ ...f, numero_serie: e.target.value }))} />
          </div>
          <textarea className="w-full px-3 py-2 border rounded" placeholder="Especificaciones" value={form.especificaciones || ''} onChange={e => setForm(f => ({ ...f, especificaciones: e.target.value }))} />
          <input className="w-full px-3 py-2 border rounded" placeholder="Tutor" value={form.tutor || ''} onChange={e => setForm(f => ({ ...f, tutor: e.target.value }))} />
          <input className="w-full px-3 py-2 border rounded" placeholder="Carrera" value={form.carrera || ''} onChange={e => setForm(f => ({ ...f, carrera: e.target.value }))} />
          <div>
            <label className="block text-sm mb-1">Archivo PDF (para investigaciones)</label>
            <input type="file" accept="application/pdf" onChange={e => {
              const file = e.target.files?.[0];
              setForm(f => ({ ...f, archivo_pdf: file }));
            }} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={Boolean(form.disponibilidad)} onChange={e => setForm(f => ({ ...f, disponibilidad: e.target.checked }))} />
            <label>Disponible</label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
