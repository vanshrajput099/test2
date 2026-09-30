"use client";
import { useState } from "react";
import StatusBadge from "./StatusBadge";
import CommissionBreakdown from "./CommissionBreakdown";
import ErrorAlert from "./ErrorAlert";
import Spinner from "./Spinner";

function computeProjection(revenueNum, user) {
  if (!user || !revenueNum) return null;
  const pool = revenueNum * 0.8;
  const companyBase = revenueNum * 0.2;

  const isManager = user.role === "MANAGER";
  const l1User = user;
  const l2User = user.hierarchy?.manager;
  // If assigned to a MANAGER: manager of that manager is Level 2, and there is NO Level 3.
  const l3User = isManager ? null : l2User?.hierarchy?.manager;

  const l1Amount = pool * 0.5;
  const l2Amount = l2User ? pool * 0.3 : 0;
  const l3Amount = l3User ? pool * 0.2 : 0;

  const unallocatedL2 = l2User ? 0 : pool * 0.3;
  const unallocatedL3 = l3User ? 0 : pool * 0.2;
  const companyTotal = companyBase + unallocatedL2 + unallocatedL3;

  return {
    isManager,
    l1: { user: l1User, amount: l1Amount, pct: 40, active: true },
    l2: { user: l2User, amount: l2Amount, pct: 24, active: !!l2User, unallocated: unallocatedL2 },
    l3: { user: l3User, amount: l3Amount, pct: 16, active: !!l3User, unallocated: unallocatedL3 },
    company: {
      baseAmount: companyBase,
      basePct: 20,
      unallocatedAmount: unallocatedL2 + unallocatedL3,
      totalAmount: companyTotal,
      totalPct: 20 + (!l2User ? 24 : 0) + (!l3User ? 16 : 0),
    },
    total: revenueNum,
  };
}

export default function LeadDetail({ lead: initial, users = [] }) {
  const [lead, setLead] = useState(initial);
  const [selectedUserId, setSelectedUserId] = useState(initial.assignment?.userId || "");
  const [loading, setLoading] = useState(null); // "assign" | "close" | null
  const [err, setErr] = useState(null);

  const isClosed = lead.status === "CLOSED";
  const isAssigned = !!lead.assignment;

  // Find candidate user for live projection preview
  const candidateUser =
    users.find((u) => u.id === selectedUserId) ||
    users.find((u) => u.id === lead.assignment?.userId) ||
    lead.assignment?.user;

  const projection = !isClosed ? computeProjection(Number(lead.revenue), candidateUser) : null;

  async function assign() {
    if (!selectedUserId) return;
    setLoading("assign");
    setErr(null);
    try {
      const res = await fetch(`/api/leads/${lead.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      // Re-fetch updated lead
      const r2 = await fetch(`/api/leads/${lead.id}`);
      const j2 = await r2.json();
      if (j2.success) setLead(j2.data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(null);
    }
  }

  async function close() {
    setLoading("close");
    setErr(null);
    try {
      const res = await fetch(`/api/leads/${lead.id}/close`, { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      // Re-fetch full lead with ledger entries and status log
      const r2 = await fetch(`/api/leads/${lead.id}`);
      const j2 = await r2.json();
      if (j2.success) setLead(j2.data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Card */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>{lead.title}</h1>
              <StatusBadge status={lead.status} />
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Lead ID: <code style={{ color: "var(--text-primary)" }}>{lead.id}</code>
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", display: "block" }}>
              Deal Revenue
            </span>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent-green)" }}>
              ₹{Number(lead.revenue).toLocaleString()}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "1rem", color: "var(--text-muted)", fontSize: "0.8rem", borderTop: "1px solid var(--border)", paddingTop: "0.8rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <span>Created: {new Date(lead.createdAt).toLocaleString()}</span>
          {lead.closedAt && <span>Closed: {new Date(lead.closedAt).toLocaleString()}</span>}
          {lead.assignment && (
            <span>
              Assigned to: <strong style={{ color: "var(--text-primary)" }}>{lead.assignment.user?.name}</strong> ({lead.assignment.user?.role})
            </span>
          )}
        </div>
      </div>

      <ErrorAlert message={err} onDismiss={() => setErr(null)} />

      {/* Actions Section (only when OPEN) */}
      {!isClosed && (
        <div className="card">
          <h3 className="section-title">⚡ Lead Assignment & Closing</h3>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div className="form-group" style={{ flex: 1, minWidth: 260 }}>
              <label>Select Agent / Manager to Assign</label>
              <select
                id="assign-user-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">— Select user —</option>
                {users.map((u) => {
                  const isMgr = u.role === "MANAGER";
                  const l2 = u.hierarchy?.manager?.name;
                  const l3 = u.hierarchy?.manager?.hierarchy?.manager?.name;
                  const chain = isMgr
                    ? (l2 ? `[L1: Manager ➔ L2: ${l2}, No L3]` : `[L1: Manager (Top Level), No L2/L3]`)
                    : (l2 ? (l3 ? `[L1: Agent ➔ L2: ${l2} ➔ L3: ${l3}]` : `[L1: Agent ➔ L2: ${l2}, No L3]`) : `[L1: Agent (Direct), No L2/L3]`);
                  return (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role}) {chain}
                    </option>
                  );
                })}
              </select>
            </div>
            <button
              id="assign-btn"
              className="btn btn-primary"
              onClick={assign}
              disabled={!selectedUserId || loading === "assign" || selectedUserId === lead.assignment?.userId}
            >
              {loading === "assign" ? <><Spinner size="sm" inline /> Saving…</> : isAssigned ? "Reassign User" : "Assign User"}
            </button>
            {isAssigned && (
              <button
                id="close-lead-btn"
                className="btn btn-danger"
                onClick={close}
                disabled={loading === "close"}
                style={{ padding: "0.65rem 1.4rem", fontWeight: 600 }}
              >
                {loading === "close" ? <><Spinner size="sm" inline /> Closing Lead…</> : "✓ Mark Closed & Distribute Commission"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Live Commission Projection Preview (Visible when OPEN) */}
      {!isClosed && (
        <div className="card" style={{ border: "1px solid var(--accent-glow)", background: "rgba(108, 99, 255, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <h3 className="section-title" style={{ marginBottom: "0.2rem" }}>
                🔮 Live Commission Distribution Preview
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
                {candidateUser
                  ? `Projected distribution for ${candidateUser.name} (${candidateUser.role}) on closing ₹${Number(lead.revenue).toLocaleString()}`
                  : "Select an agent or manager above to preview the hierarchy split before closing."}
              </p>
            </div>
            {candidateUser && (
              <span className="badge" style={{ background: "rgba(34, 197, 94, 0.15)", color: "var(--accent-green)" }}>
                Live Calculation
              </span>
            )}
          </div>

          {projection ? (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                {/* Level 1 Card */}
                <div
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "1rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--accent)", textTransform: "uppercase" }}>
                      Level 1 · {projection.isManager ? "Assigned Manager" : "Assigned Agent"}
                    </span>
                    <span className="badge badge-role">40%</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "1rem", color: "var(--text-primary)" }}>
                    {projection.l1.user.name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.6rem" }}>
                    {projection.l1.user.email}
                  </div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-green)" }}>
                    ₹{projection.l1.amount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    50% of 80% pool
                  </div>
                </div>

                {/* Level 2 Card */}
                <div
                  style={{
                    background: "var(--bg-secondary)",
                    border: `1px solid ${projection.l2.active ? "var(--border)" : "rgba(239, 68, 68, 0.2)"}`,
                    borderRadius: "var(--radius-sm)",
                    padding: "1rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#a5b4fc", textTransform: "uppercase" }}>
                      Level 2 · Manager
                    </span>
                    <span className="badge" style={{ background: "rgba(108, 99, 255, 0.15)", color: "#a5b4fc" }}>
                      24%
                    </span>
                  </div>
                  {projection.l2.active ? (
                    <>
                      <div style={{ fontWeight: 600, fontSize: "1rem", color: "var(--text-primary)" }}>
                        {projection.l2.user.name}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.6rem" }}>
                        {projection.l2.user.email}
                      </div>
                      <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-green)" }}>
                        ₹{projection.l2.amount.toLocaleString()}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        30% of 80% pool
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontWeight: 500, fontSize: "0.9rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                        No Manager (L2)
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--accent-amber)", marginTop: "0.4rem" }}>
                        Share rolls to Company
                      </div>
                      <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-muted)", marginTop: "0.4rem" }}>
                        +₹{(Number(lead.revenue) * 0.24).toLocaleString()} ➔ Company
                      </div>
                    </>
                  )}
                </div>

                {/* Level 3 Card */}
                <div
                  style={{
                    background: "var(--bg-secondary)",
                    border: `1px solid ${projection.l3.active ? "var(--border)" : "rgba(239, 68, 68, 0.2)"}`,
                    borderRadius: "var(--radius-sm)",
                    padding: "1rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#86efac", textTransform: "uppercase" }}>
                      Level 3 · Manager's Mgr
                    </span>
                    <span className="badge" style={{ background: "rgba(34, 197, 94, 0.15)", color: "#86efac" }}>
                      16%
                    </span>
                  </div>
                  {projection.isManager ? (
                    <>
                      <div style={{ fontWeight: 500, fontSize: "0.85rem", color: "var(--accent-amber)" }}>
                        No Level 3 (Assigned to Manager)
                      </div>
                      <div style={{ fontSize: "0.73rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                        Manager-assigned deals stop at Level 2. 16% rolls to Company.
                      </div>
                      <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--accent-amber)", marginTop: "0.4rem" }}>
                        +₹{(Number(lead.revenue) * 0.16).toLocaleString()} ➔ Company
                      </div>
                    </>
                  ) : projection.l3.active ? (
                    <>
                      <div style={{ fontWeight: 600, fontSize: "1rem", color: "var(--text-primary)" }}>
                        {projection.l3.user.name}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.6rem" }}>
                        {projection.l3.user.email}
                      </div>
                      <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-green)" }}>
                        ₹{projection.l3.amount.toLocaleString()}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        20% of 80% pool
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontWeight: 500, fontSize: "0.9rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                        No Manager's Mgr (L3)
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--accent-amber)", marginTop: "0.4rem" }}>
                        Share rolls to Company
                      </div>
                      <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-muted)", marginTop: "0.4rem" }}>
                        +₹{(Number(lead.revenue) * 0.16).toLocaleString()} ➔ Company
                      </div>
                    </>
                  )}
                </div>

                {/* Company Retained Card */}
                <div
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "1rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--accent-amber)", textTransform: "uppercase" }}>
                      🏢 Company Retained
                    </span>
                    <span className="badge" style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--accent-amber)" }}>
                      {projection.company.totalPct}%
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "1rem", color: "var(--text-primary)" }}>
                    Base (20%) + Unallocated
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.6rem" }}>
                    Base: ₹{projection.company.baseAmount.toLocaleString()}
                    {projection.company.unallocatedAmount > 0 && ` + Rollover: ₹${projection.company.unallocatedAmount.toLocaleString()}`}
                  </div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-green)" }}>
                    ₹{projection.company.totalAmount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    Guaranteed unallocated rollover
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "0.75rem 1rem",
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <span>
                  💡 <strong>Hierarchy Rule:</strong>{" "}
                  {projection.isManager
                    ? "Lead assigned to Manager: Manager is Level 1 (40%), their Manager is Level 2 (24%), and there is NO Level 3 (16% rolls to Company)."
                    : "Lead assigned to Agent: Agent is Level 1 (40%), their Manager is Level 2 (24%), and Level 2's Manager is Level 3 (16%)."}
                </span>
                <span>
                  Total deal: ₹{projection.total.toLocaleString()} (100.0%)
                </span>
              </div>
            </div>
          ) : (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
              Please select a user above to see the hierarchy commission preview.
            </div>
          )}
        </div>
      )}

      {/* Closed Commission Breakdown */}
      {isClosed && (
        <CommissionBreakdown commissions={lead.commissions} companyLedger={lead.companyLedger} />
      )}

      {/* Audit Trail / Status History */}
      {lead.statusLogs?.length > 0 && (
        <div className="card">
          <h3 className="section-title">📜 Audit Trail & State Transitions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
            {lead.statusLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  padding: "0.65rem 0.9rem",
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                  fontSize: "0.85rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span className="badge badge-open">{log.fromStatus}</span>
                  <span style={{ color: "var(--text-muted)" }}>➔</span>
                  <span className="badge badge-closed">{log.toStatus}</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    Status changed to {log.toStatus}
                  </span>
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                  {new Date(log.changedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
