import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { getApiErrorMessage } from '../../api/client';
import { usersService } from '../../api/users.service';
import { Alert } from '../../components/Alert';
import { Modal } from '../../components/Modal';
import { Spinner } from '../../components/Spinner';
import { TextField } from '../../components/TextField';
import { useAuth } from '../../hooks/useAuth';
import type { UpdateUserPayload, User, UserRole } from '../../types';
import { formatDate } from '../../utils/format';
import { isMinLength, isValidEmail, type FieldErrors } from '../../utils/validation';

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; password: string; role: UserRole }>({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await usersService.list());
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openEdit(u: User) {
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setErrors({});
    setEditing(u);
  }

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (!isMinLength(form.name, 2)) e.name = 'Nome deve ter ao menos 2 caracteres.';
    if (!isValidEmail(form.email)) e.email = 'E-mail invalido.';
    if (form.password && !isMinLength(form.password, 8)) e.password = 'A senha deve ter ao menos 8 caracteres.';
    return e;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!editing) return;
    const v = validate();
    setErrors(v);
    if (Object.values(v).some(Boolean)) return;

    const payload: UpdateUserPayload = { name: form.name, email: form.email };
    if (form.password) payload.password = form.password;
    if (form.role !== editing.role) payload.role = form.role;

    setSaving(true);
    setError('');
    try {
      await usersService.update(editing.id, payload);
      setEditing(null);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Nao foi possivel salvar o usuario.'));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setError('');
    try {
      await usersService.remove(toDelete.id);
      setToDelete(null);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Nao foi possivel excluir o usuario.'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Usuarios</h1>

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : users.length === 0 ? (
        <p className="py-12 text-center text-slate-500">Nenhum usuario encontrado.</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3 text-center">Papel</th>
                <th className="px-4 py-3">Criado em</th>
                <th className="px-4 py-3 text-right">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {u.name}
                      {isSelf && <span className="ml-2 text-xs text-slate-400">(voce)</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`badge ${
                          u.role === 'ADMIN' ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => openEdit(u)} className="text-brand-600 hover:underline">
                          Editar
                        </button>
                        <button
                          onClick={() => setToDelete(u)}
                          disabled={isSelf}
                          className="text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-300 disabled:no-underline"
                          title={isSelf ? 'Voce nao pode excluir a si mesmo' : undefined}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={Boolean(editing)} title="Editar usuario" onClose={() => setEditing(null)}>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <TextField
            label="Nome *"
            name="name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            error={errors.name}
          />
          <TextField
            label="E-mail *"
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            error={errors.email}
          />
          <TextField
            label="Nova senha (opcional)"
            name="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            error={errors.password}
            placeholder="Deixe em branco para manter a atual"
          />
          <div>
            <label htmlFor="role" className="label">
              Papel
            </label>
            <select
              id="role"
              className="input"
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as UserRole }))}
              disabled={editing?.id === currentUser?.id}
            >
              <option value="CUSTOMER">CUSTOMER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            {editing?.id === currentUser?.id && (
              <p className="mt-1 text-xs text-slate-400">Voce nao pode alterar o proprio papel.</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setEditing(null)} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(toDelete)} title="Excluir usuario" onClose={() => setToDelete(null)}>
        <p className="text-sm text-slate-600">
          Excluir <strong>{toDelete?.name}</strong> ({toDelete?.email})?
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
