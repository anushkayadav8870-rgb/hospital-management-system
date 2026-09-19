// =============================================
// client/src/components/common/Badge.jsx
//
// CONCEPT: Props & Conditional Rendering
// =============================================
// This component receives a "variant" prop (e.g. "success", "danger")
// and a "children" prop (the text inside the badge).
//
// It uses those props to pick the right CSS class.
// This is a classic pattern: one reusable component, many appearances.
//
// Usage:
//   <Badge variant="success">Active</Badge>
//   <Badge variant="warning">Pending</Badge>
//   <Badge variant="danger">Cancelled</Badge>
// =============================================

// "variant" defaults to "neutral" if not provided (default parameter)
export default function Badge({ variant = 'neutral', children }) {
  return (
    <span className={`badge badge-${variant}`}>
      {children}
    </span>
  );
}
