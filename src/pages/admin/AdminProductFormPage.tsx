import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { categoriesService } from '../../api/categories.service';
import { getApiErrorMessage } from '../../api/client';
import { productsService } from '../../api/products.service';
import { Alert } from '../../components/Alert';
import { Spinner } from '../../components/Spinner';
import { TextAreaField, TextField } from '../../components/TextField';
import type { Category, CreateProductPayload } from '../../types';
import { hasErrors, validateProduct, type FieldErrors } from '../../utils/validation';

const EMPTY: CreateProductPayload = {
  name: '',
  description: '',
  price: 0,
  stock: 0,
  categoryId: '',
  active: true,
};

export function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateProductPayload>(EMPTY);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  // Upload de imagem
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadMsg, setUploadMsg] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let active = true;
    categoriesService
      .list()
      .then((cats) => active && setCategories(cats))
      .catch((err) => active && setServerError(getApiErrorMessage(err)));

    if (isEdit && id) {
      productsService
        .getById(id)
        .then((p) => {
          if (!active) return;
          setForm({
            name: p.name,
            description: p.description,
            price: p.price,
            stock: p.stock,
            categoryId: p.categoryId,
            active: p.active,
            image: p.image,
            thumbnail: p.thumbnail,
          });
        })
        .catch((err) => active && setServerError(getApiErrorMessage(err)))
        .finally(() => active && setLoading(false));
    }
    return () => {
      active = false;
    };
  }, [id, isEdit]);

  function update<K extends keyof CreateProductPayload>(field: K, value: CreateProductPayload[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError('');
    const validation = validateProduct(form);
    setErrors(validation);
    if (hasErrors(validation)) return;

    setSubmitting(true);
    try {
      if (isEdit && id) {
        await productsService.update(id, form);
      } else {
        const created = await productsService.create(form);
        // Se um arquivo foi escolhido na criacao, faz o upload em seguida.
        if (imageFile) {
          await productsService.uploadImage(created.id, imageFile);
        }
      }
      navigate('/admin/products');
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'Nao foi possivel salvar o produto.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpload() {
    if (!id || !imageFile) return;
    setUploading(true);
    setUploadMsg('');
    setServerError('');
    try {
      const updated = await productsService.uploadImage(id, imageFile);
      setForm((prev) => ({ ...prev, image: updated.image, thumbnail: updated.thumbnail }));
      setUploadMsg('Imagem enviada com sucesso.');
      setImageFile(null);
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'Falha no upload da imagem.'));
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <Spinner label="Carregando produto..." />;

  return (
    <div className="max-w-2xl">
      <Link to="/admin/products" className="mb-4 inline-block text-sm text-brand-600 hover:underline">
        &larr; Voltar
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">{isEdit ? 'Editar produto' : 'Novo produto'}</h1>

      {serverError && (
        <div className="mb-4">
          <Alert variant="error">{serverError}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-4 p-6" noValidate>
        <TextField
          label="Nome *"
          name="name"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          error={errors.name}
        />
        <TextAreaField
          label="Descricao *"
          name="description"
          rows={3}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          error={errors.description}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Preco (R$) *"
            name="price"
            type="number"
            step="0.01"
            min="0.01"
            value={form.price}
            onChange={(e) => update('price', Number(e.target.value))}
            error={errors.price}
          />
          <TextField
            label="Estoque *"
            name="stock"
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => update('stock', Number(e.target.value))}
            error={errors.stock}
          />
        </div>

        <div>
          <label htmlFor="categoryId" className="label">
            Categoria *
          </label>
          <select
            id="categoryId"
            className={`input ${errors.categoryId ? 'border-red-400' : ''}`}
            value={form.categoryId}
            onChange={(e) => update('categoryId', e.target.value)}
          >
            <option value="">Selecione...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId}</p>}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.active ?? true}
            onChange={(e) => update('active', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Produto ativo (visivel no catalogo)
        </label>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Link to="/admin/products" className="btn-secondary">
            Cancelar
          </Link>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>

      {/* Upload de imagem: disponivel apos o produto existir. */}
      <div className="card mt-6 p-6">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Imagem do produto</h2>
        <p className="mb-4 text-sm text-slate-500">
          {isEdit ? 'Envie uma imagem (max. 5MB).' : 'Selecione uma imagem; ela sera enviada apos criar o produto.'}
        </p>

        {form.image && (
          <img src={form.image} alt="Previa" className="mb-4 h-40 w-40 rounded-lg border object-cover" />
        )}

        {uploadMsg && (
          <div className="mb-3">
            <Alert variant="success">{uploadMsg}</Alert>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          className="block text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
        />

        {isEdit && (
          <button
            type="button"
            className="btn-primary mt-4"
            onClick={handleUpload}
            disabled={!imageFile || uploading}
          >
            {uploading ? 'Enviando...' : 'Enviar imagem'}
          </button>
        )}
      </div>
    </div>
  );
}
