interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, onChange }: PaginationProps) {
  if (total === 0) return null;
  return (
    <div className="mt-6 flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">
        Pagina {page} de {totalPages} &middot; {total} {total === 1 ? 'item' : 'itens'}
      </span>
      <div className="flex gap-2">
        <button
          className="btn-secondary py-1.5"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
        >
          Anterior
        </button>
        <button
          className="btn-secondary py-1.5"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
        >
          Proxima
        </button>
      </div>
    </div>
  );
}
