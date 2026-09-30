export default function StatusBadge({ status }) {
  const isOpen = status === "OPEN";
  return (
    <span className={`badge ${isOpen ? "badge-open" : "badge-closed"}`}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: isOpen ? "var(--accent-green)" : "var(--accent-red)",
        display: "inline-block",
        animation: isOpen ? "pulse 2s infinite" : "none",
      }} />
      {status}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </span>
  );
}
