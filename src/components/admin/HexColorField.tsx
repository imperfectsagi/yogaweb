"use client";

import { cn } from "@/lib/utils";

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * One HEX-color input for the Site Settings "Homepage Text Colors" card.
 * Pairs a plain text input (so admins can type or paste a HEX code
 * directly, e.g. from a brand guide) with a native <input type="color">
 * swatch as an optional visual picker, and a live preview swatch that
 * reflects the current value (or a neutral placeholder when empty/invalid,
 * so a bad value never silently renders as a misleading color).
 *
 * Deliberately un-opinionated about persistence: this component only
 * reports HEX string changes upward via onChange. The parent
 * (SiteSettingsClient) owns the actual value, validation-before-save, and
 * default-fallback behavior when the field is left empty.
 */
export function HexColorField({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const trimmed = value.trim();
  const isValid = trimmed === "" || HEX_RE.test(trimmed);
  // The native color picker requires a full 6-digit #RRGGBB value; feed it
  // the current value only when valid, otherwise a neutral gray so opening
  // the picker on an empty/invalid field doesn't look broken.
  const pickerValue = isValid && trimmed !== "" ? normalizeToSixDigit(trimmed) : "#9ca3af";

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <span
          className="h-9 w-9 shrink-0 rounded border border-border"
          style={{ backgroundColor: isValid && trimmed !== "" ? trimmed : "transparent" }}
          aria-hidden="true"
        />
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#2F6657"
          maxLength={7}
          className={cn(
            "w-full rounded border px-3 py-2.5 text-base sm:text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
            isValid ? "border-border" : "border-red-300"
          )}
        />
        {/* Optional visual picker — purely a convenience. Its own onChange
            always writes a full valid #RRGGBB, so using it can never
            produce an invalid saved value even if the text field
            currently holds one. */}
        <input
          type="color"
          value={pickerValue}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`Pick ${label.toLowerCase()}`}
          className="h-9 w-9 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0"
        />
      </div>
      {!isValid && (
        <p className="mt-1 text-xs text-red-600">Enter a valid HEX code, e.g. #2F6657, or leave blank for the default.</p>
      )}
      {isValid && hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function normalizeToSixDigit(hex: string): string {
  if (hex.length === 4) {
    // #RGB -> #RRGGBB
    const [, r, g, b] = hex;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return hex;
}
