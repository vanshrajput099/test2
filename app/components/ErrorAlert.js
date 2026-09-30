export default function ErrorAlert({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div style={{
      background: "rgba(239,68,68,0.1)",
      border: "1px solid rgba(239,68,68,0.3)",
      borderRadius: "var(--radius-sm)",
      padding: "0.75rem 1rem",
      color: "var(--accent-red)",
      fontSize: "0.875rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1rem",
    }}>
      <span>⚠ {message}</span>
      {onDismiss && (
        <button onClick={onDismiss} style={{
          background: "none",
          border: "none",
          color: "var(--accent-red)",
          cursor: "pointer",
          fontSize: "1rem",
          padding: "0 0.25rem",
        }}>×</button>
      )}
    </div>
  );
}
