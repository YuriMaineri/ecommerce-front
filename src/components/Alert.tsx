type AlertVariant = 'error' | 'success' | 'info';

const STYLES: Record<AlertVariant, string> = {
  error: 'bg-red-50 text-red-700 border-red-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
};

export function Alert({ variant = 'info', children }: { variant?: AlertVariant; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${STYLES[variant]}`} role="alert">
      {children}
    </div>
  );
}
