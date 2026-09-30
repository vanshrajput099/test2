"use client";
import { useState } from "react";
import ErrorAlert from "./ErrorAlert";

export default function UserForm({ users, onCreated }) {
  const [form, setForm] = useState({ name: "", email: "", role: "AGENT", managerId: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const managers = users.filter((u) => u.role === "MANAGER");
  const selectedManager = managers.find((m) => m.id === form.managerId);
  const l3Manager = selectedManager?.hierarchy?.manager;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const body = { ...form };
      if (!body.managerId) delete body.managerId;
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setForm({ name: "", email: "", role: "AGENT", managerId: "" });
      onCreated(json.data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="card">
      <h2 className="section-title">Create User</h2>
      <ErrorAlert message={err} onDismiss={() => setErr(null)} />
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="form-group">
          <label>Name</label>
          <input
            id="user-name"
            value={form.name}
            onChange={set("name")}
            required
            placeholder="Alice Smith"
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            id="user-email"
            type="email"
            value={form.email}
            onChange={set("email")}
            required
            placeholder="alice@acme.com"
          />
        </div>
        <div className="form-group">
          <label>Role</label>
          <select id="user-role" value={form.role} onChange={set("role")}>
            <option value="AGENT">Agent</option>
            <option value="MANAGER">Manager</option>
          </select>
        </div>
        {managers.length > 0 && (
          <div className="form-group">
            <label>Manager (optional)</label>
            <select id="user-manager" value={form.managerId} onChange={set("managerId")}>
              <option value="">— No manager —</option>
              {managers.map((m) => {
                const mgrParent = m.hierarchy?.manager?.name;
                return (
                  <option key={m.id} value={m.id}>
                    {m.name} {mgrParent ? `(reports to ${mgrParent})` : "(Top Level Manager)"}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {selectedManager ? (
          <div
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-light)",
              borderRadius: "var(--radius-sm)",
              padding: "0.85rem",
              fontSize: "0.8rem",
            }}
          >
            <div style={{ fontWeight: 600, color: "var(--accent-hover)", marginBottom: "0.4rem" }}>
              ⚡ Reporting Hierarchy Preview:
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
              <span className="badge badge-role">L1: {form.name.trim() || "New User"} ({form.role})</span>
              <span style={{ color: "var(--text-muted)" }}>➔</span>
              <span className="badge" style={{ background: "rgba(108, 99, 255, 0.2)", color: "#a5b4fc" }}>
                L2: {selectedManager.name}
              </span>
              {form.role === "MANAGER" ? (
                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontStyle: "italic" }}>
                  (No L3 for Manager deals)
                </span>
              ) : l3Manager ? (
                <>
                  <span style={{ color: "var(--text-muted)" }}>➔</span>
                  <span className="badge" style={{ background: "rgba(34, 197, 94, 0.2)", color: "#86efac" }}>
                    L3: {l3Manager.name}
                  </span>
                </>
              ) : (
                <>
                  <span style={{ color: "var(--text-muted)" }}>➔</span>
                  <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No L3 (rolls to company)</span>
                </>
              )}
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem", lineHeight: 1.4 }}>
              {form.role === "MANAGER"
                ? "Manager lead rule: If a deal is assigned to this Manager, L1 gets 40%, L2 gets 24%, and Level 3 does not exist (16% rolls to Company, total company 36%)."
                : l3Manager
                ? "Full 3-tier hierarchy: L1 gets 40%, L2 gets 24%, L3 gets 16%, Company gets 20% base."
                : "Partial chain: L1 gets 40%, L2 gets 24%, Unallocated L3 (16%) rolls to Company (total 36%)."}
            </div>
          </div>
        ) : (
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "-0.5rem" }}>
            {form.role === "MANAGER"
              ? "ℹ️ Setting up a Top-Level Manager. No manager above this user (deals assigned directly give 40% to manager, 60% to company)."
              : "ℹ️ No manager assigned. L2 (24%) and L3 (16%) shares will roll to Company upon closing."}
          </p>
        )}

        <button id="create-user-btn" className="btn btn-primary" disabled={loading} type="submit">
          {loading ? "Creating…" : "+ Create User"}
        </button>
      </form>
    </div>
  );
}
