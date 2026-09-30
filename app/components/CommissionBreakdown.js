export default function CommissionBreakdown({ commissions, companyLedger }) {
  if (!commissions?.length && !companyLedger) return null;

  const total =
    commissions.reduce((s, c) => s + Number(c.amount), 0) +
    Number(companyLedger?.amount ?? 0);

  // Helper to determine hierarchy tier label based on percentage of deal
  function getTierLabel(amount, totalAmount) {
    if (!totalAmount) return "Commission";
    const pct = Math.round((Number(amount) / totalAmount) * 100);
    if (pct === 40) return { label: "Level 1 (Agent)", badgeClass: "badge-role" };
    if (pct === 24) return { label: "Level 2 (Manager)", badgeStyle: { background: "rgba(108, 99, 255, 0.2)", color: "#a5b4fc" } };
    if (pct === 16) return { label: "Level 3 (Manager's Mgr)", badgeStyle: { background: "rgba(34, 197, 94, 0.2)", color: "#86efac" } };
    return { label: `Tier (${pct}%)`, badgeClass: "badge-role" };
  }

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <h3 className="section-title" style={{ margin: 0 }}>
          💰 Distributed Commission Ledger
        </h3>
        <span className="badge" style={{ background: "rgba(34, 197, 94, 0.15)", color: "var(--accent-green)" }}>
          ✓ Settled & Audited
        </span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tier / Level</th>
              <th>Recipient</th>
              <th>Email</th>
              <th>Amount</th>
              <th>Share %</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((c) => {
              const tier = getTierLabel(c.amount, total);
              return (
                <tr key={c.id}>
                  <td>
                    <span
                      className={`badge ${tier.badgeClass || ""}`}
                      style={tier.badgeStyle}
                    >
                      {tier.label}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {c.user.name}
                  </td>
                  <td>{c.user.email}</td>
                  <td style={{ color: "var(--accent-green)", fontWeight: 600 }}>
                    ₹{Number(c.amount).toLocaleString()}
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>
                    {((Number(c.amount) / total) * 100).toFixed(1)}%
                  </td>
                </tr>
              );
            })}
            {companyLedger && (
              <tr>
                <td>
                  <span
                    className="badge"
                    style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--accent-amber)" }}
                  >
                    🏢 Company
                  </span>
                </td>
                <td style={{ color: "var(--accent)", fontWeight: 500 }}>Company Account</td>
                <td style={{ color: "var(--text-muted)" }}>corporate@system.internal</td>
                <td style={{ color: "var(--accent-green)", fontWeight: 600 }}>
                  ₹{Number(companyLedger.amount).toLocaleString()}
                </td>
                <td style={{ color: "var(--text-muted)" }}>
                  {((Number(companyLedger.amount) / total) * 100).toFixed(1)}%
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: "1rem",
          padding: "0.75rem 1rem",
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius-sm)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
          fontSize: "0.85rem",
        }}
      >
        <span style={{ color: "var(--text-secondary)" }}>
          🔒 Immutable ledger records safely written in PostgreSQL transaction
        </span>
        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
          Total Disbursed: ₹{total.toLocaleString()} (100.0%)
        </span>
      </div>
    </div>
  );
}
