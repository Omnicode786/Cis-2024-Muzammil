export function TextareaField({
  label,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <textarea className="field__input field__textarea" {...props} />
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}
