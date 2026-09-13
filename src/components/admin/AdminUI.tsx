"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { Trash2, Pencil, Plus, Eye, EyeOff } from "lucide-react";

// ---------------------------------------------------------------------------
// Page header with a primary action (e.g. "+ New Service")
// ---------------------------------------------------------------------------
export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="btn-primary inline-flex items-center justify-center gap-1.5 text-sm shrink-0"
        >
          <Plus className="h-4 w-4" />
          {action.label}
        </Link>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Alert banners
// ---------------------------------------------------------------------------
export function AdminAlert({ type, children }: { type: "error" | "success"; children: React.ReactNode }) {
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={cn(
        "mb-4 rounded-button border px-3 py-2 text-sm",
        type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"
      )}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card container (used for both the list wrapper and individual mobile
// cards). On desktop, lists render as a table; on mobile, as stacked cards.
// ---------------------------------------------------------------------------
export function AdminCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-border bg-white p-4 shadow-sm sm:p-6", className)}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Responsive record list: cards on mobile (<sm), table on desktop (>=sm).
// Each item's `fields` render as label/value rows on mobile and as columns
// on desktop.
// ---------------------------------------------------------------------------
export type ListField = { label: string; value: React.ReactNode; primary?: boolean };

export function AdminList({
  items,
  emptyMessage,
  renderActions,
}: {
  items: { id: string; fields: ListField[]; badge?: React.ReactNode }[];
  emptyMessage: string;
  renderActions: (id: string) => React.ReactNode;
}) {
  if (!items.length) {
    return (
      <AdminCard>
        <p className="text-sm text-muted text-center py-6">{emptyMessage}</p>
      </AdminCard>
    );
  }

  const primaryField = (fields: ListField[]) => fields.find((f) => f.primary) || fields[0];
  const secondaryFields = (fields: ListField[]) => fields.filter((f) => f !== primaryField(fields));

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="space-y-3 sm:hidden">
        {items.map((item) => (
          <AdminCard key={item.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{primaryField(item.fields).value}</p>
                  {item.badge}
                </div>
                <dl className="mt-1.5 space-y-1">
                  {secondaryFields(item.fields).map((f, i) => (
                    <div key={i} className="flex gap-1.5 text-xs text-muted">
                      <dt className="font-medium">{f.label}:</dt>
                      <dd className="truncate">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
              {renderActions(item.id)}
            </div>
          </AdminCard>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-lg border border-border bg-white shadow-sm sm:block">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-muted">
            <tr>
              {items[0]?.fields.map((f, i) => (
                <th key={i} className="px-4 py-3">
                  {f.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/70">
                {item.fields.map((f, i) => (
                  <td key={i} className="px-4 py-3 align-top max-w-[240px] truncate">
                    {i === 0 ? (
                      <span className="flex items-center gap-2 font-medium">
                        {f.value}
                        {item.badge}
                      </span>
                    ) : (
                      f.value
                    )}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">{renderActions(item.id)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function EditAction({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center gap-1 rounded-button border border-border px-3 text-xs font-medium hover:bg-primary/5 sm:h-8"
    >
      <Pencil className="h-3.5 w-3.5" />
      Edit
    </Link>
  );
}

export function DeleteAction({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 items-center gap-1 rounded-button border border-red-200 px-3 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 sm:h-8"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Delete
    </button>
  );
}

export function PublishBadge({ published }: { published: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
        published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
      )}
    >
      {published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
      {published ? "Published" : "Draft"}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Form primitives — mobile-first: full-width, 44px+ touch targets, 16px
// text (prevents iOS auto-zoom on focus).
// ---------------------------------------------------------------------------
export function Field({
  label,
  htmlFor,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

const inputBase =
  "w-full rounded border border-border px-3 py-2.5 text-base sm:text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputBase, props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputBase, "min-h-[8rem]", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputBase, "bg-white", props.className)} />;
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-gray-300"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
      <span className="text-sm">{label}</span>
    </label>
  );
}

export function FormActions({
  onCancelHref,
  saving,
  saveLabel = "Save",
}: {
  onCancelHref: string;
  saving: boolean;
  saveLabel?: string;
}) {
  return (
    <div className="sticky bottom-0 -mx-4 mt-6 flex gap-3 border-t border-border bg-white px-4 py-3 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
      <Link href={onCancelHref} className="btn-secondary flex-1 sm:flex-none">
        Cancel
      </Link>
      <button type="submit" disabled={saving} className="btn-primary flex-1 sm:flex-none">
        {saving ? "Saving…" : saveLabel}
      </button>
    </div>
  );
}
