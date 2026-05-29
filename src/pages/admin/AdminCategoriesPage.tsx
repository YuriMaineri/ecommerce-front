import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { categoriesService } from '../../api/categories.service';
import { getApiErrorMessage } from '../../api/client';
import { Alert } from '../../components/Alert';
import { Modal } from '../../components/Modal';
import { Spinner } from '../../components/Spinner';
import { TextAreaField, TextField } from '../../components/TextField';
import type { Category } from '../../types';
import { hasErrors, validateCategory, type FieldErrors } from '../../utils/validation';

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCategories(await categoriesService.list());
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setForm({ name: '', description: '' });
    setErrors({});
    setCreating(true);
  }

  function openEdit(category: Category) {
    setForm({ name: category.name, description: category.description });
    setErrors({});
    setEditing(category);
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validation = validateCategory(form);
    setErrors(validation);
    if (hasErrors(validation)) return;

    setSaving(true);
    setError('');
    try {
      if (editing) {
        await categoriesService.update(editing.id, form);
      } else {
        await categoriesService.create(form);
      }
      closeForm();
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Nao foi possivel salvar a categoria.'));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setError('');
    try {
      await categoriesService.remove(toDelete.id);
      setToDelete(null);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Nao foi possivel excluir (verifique se ha produtos vinculados).'));
    } finally {
      setDeleting(false);
    }
  }

  const formOpen = creating || Boolean(editing);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Categorias</h1>
        <button onClick={openCreate} className="btn-primary">
          + Nova categoria
        </button>
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : categories.length === 0 ? (
        <p className="py-12 text-center text-slate-500">Nenhuma categoria cadastrada.</p>
      ) : (
        <div className="card divide-y divide-slate-100">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-slate-800">{c.name}</p>
                <p className="text-sm text-slate-500">{c.description}</p>
              </div>
              <div className="flex gap-3 text-sm">
                <button onClick={() => openEdit(c)} className="text-brand-600 hover:underline">
                  Editar
                </button>
                <button onClick={() => setToDelete(c)} className="text-red-600 hover:underline">
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={formOpen} title={editing ? 'Editar categoria' : 'Nova categoria'} onClose={closeForm}>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <TextField
            label="Nome *"
            name="name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            error={errors.name}
          />
          <TextAreaField
            label="Descricao *"
            name="description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            error={errors.description}
          />
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={closeForm} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(toDelete)} title="Excluir categoria" onClose={() => setToDelete(null)}>
        <p className="text-sm text-slate-600">
          Excluir <strong>{toDelete?.name}</strong>?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => setToDelete(null)} disabled={deleting}>
            Cancelar
          </button>
          <button className="btn-danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
