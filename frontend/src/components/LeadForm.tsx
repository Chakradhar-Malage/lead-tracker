import { useState, type FormEvent } from "react";
import type { LeadCreateInput } from "../api/types";

interface LeadFormProps {
  onSubmit: (input: LeadCreateInput) => Promise<void>;
  onCancel: () => void;
}

interface FieldErrors {
  name?: string;
  email?: string;
  phone?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(input: LeadCreateInput): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.name.trim()) errors.name = "Name is required.";
  if (!input.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!input.phone.trim()) errors.phone = "Phone number is required.";
  return errors;
}

export function LeadForm({ onSubmit, onCancel }: LeadFormProps) {
  const [values, setValues] = useState<LeadCreateInput>({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange =
    (field: keyof LeadCreateInput) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const fieldErrors = validate(values);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
      });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not save this lead.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="entry-panel" onSubmit={handleSubmit} noValidate>
      <h2 className="entry-panel__title">New lead</h2>

      {submitError && <div className="form-error">{submitError}</div>}

      <div className="entry-panel__grid">
        <div className="field">
          <label htmlFor="lead-name">Name</label>
          <input
            id="lead-name"
            value={values.name}
            onChange={handleChange("name")}
            aria-invalid={Boolean(errors.name)}
            placeholder="Jordan Blake"
            autoFocus
          />
          {errors.name && <p className="field__error">{errors.name}</p>}
        </div>

        <div className="field">
          <label htmlFor="lead-email">Email</label>
          <input
            id="lead-email"
            type="email"
            value={values.email}
            onChange={handleChange("email")}
            aria-invalid={Boolean(errors.email)}
            placeholder="jordan@company.com"
          />
          {errors.email && <p className="field__error">{errors.email}</p>}
        </div>

        <div className="field">
          <label htmlFor="lead-phone">Phone</label>
          <input
            id="lead-phone"
            type="tel"
            value={values.phone}
            onChange={handleChange("phone")}
            aria-invalid={Boolean(errors.phone)}
            placeholder="+1 555 010 2000"
          />
          {errors.phone && <p className="field__error">{errors.phone}</p>}
        </div>
      </div>

      <div className="entry-panel__actions">
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? "Saving…" : "Save lead"}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
