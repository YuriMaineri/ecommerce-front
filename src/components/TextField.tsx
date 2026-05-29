import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TextField({ label, error, id, className, ...rest }: TextFieldProps) {
  const fieldId = id ?? rest.name;
  return (
    <div>
      <label htmlFor={fieldId} className="label">
        {label}
      </label>
      <input
        id={fieldId}
        className={`input ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''} ${className ?? ''}`}
        aria-invalid={Boolean(error)}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextAreaField({ label, error, id, className, ...rest }: TextAreaFieldProps) {
  const fieldId = id ?? rest.name;
  return (
    <div>
      <label htmlFor={fieldId} className="label">
        {label}
      </label>
      <textarea
        id={fieldId}
        className={`input ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''} ${className ?? ''}`}
        aria-invalid={Boolean(error)}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
