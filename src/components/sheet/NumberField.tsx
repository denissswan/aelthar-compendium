"use client";

interface NumberFieldProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  ariaLabel?: string;
}

/** Tap-to-edit numeric input (no spinners, styled to blend into the sheet). */
export default function NumberField({
  value,
  onChange,
  className = "",
  ariaLabel,
}: NumberFieldProps) {
  return (
    <input
      type="number"
      inputMode="numeric"
      aria-label={ariaLabel}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? 0 : parseInt(v, 10) || 0);
      }}
      onFocus={(e) => e.target.select()}
      className={`bg-transparent text-center tabular-nums focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${className}`}
    />
  );
}
