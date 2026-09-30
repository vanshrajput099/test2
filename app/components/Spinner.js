"use client";

/**
 * Reusable spinning loader component.
 *
 * @param {"sm"|"md"|"lg"} [size="md"] – visual size preset
 * @param {string}         [label]     – optional accessible text shown beneath the spinner
 * @param {boolean}        [inline]    – if true, renders inline (e.g. inside a button)
 * @param {string}         [color]     – custom border-top color override
 */
export default function Spinner({ size = "md", label, inline = false, color }) {
  const cls = `spinner spinner-${size}${inline ? " spinner-inline" : ""}`;

  return (
    <span className={cls} role="status" aria-label={label || "Loading"}>
      <span
        className="spinner-circle"
        style={color ? { borderTopColor: color } : undefined}
      />
      {label && !inline && <span className="spinner-label">{label}</span>}
    </span>
  );
}
