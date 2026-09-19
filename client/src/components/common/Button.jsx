// =============================================
// client/src/components/common/Button.jsx
//
// CONCEPT: Props, Events, Composition
// =============================================
// Props this component accepts:
//   variant  - "primary" | "outline" | "ghost" | "danger"  (visual style)
//   size     - "sm" | "md" | "lg"  (size)
//   onClick  - function to call when clicked  (event handler)
//   disabled - boolean, disables the button
//   type     - "button" | "submit" | "reset"  (HTML form type)
//   children - text or elements inside the button
//
// ...rest spreads any other HTML button attributes through automatically
// (e.g., style, aria-label, etc.)
// =============================================

export default function Button({
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  children,
  ...rest
}) {
  // Build the className string from props
  // "btn" is always applied, then variant and size modifiers
  const classes = [
    'btn',
    `btn-${variant}`,
    size !== 'md' ? `btn-${size}` : '',
  ]
    .filter(Boolean)   // remove empty strings
    .join(' ');        // join into "btn btn-primary btn-sm"

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
