"use client";
import { useUsers } from "./hooks/useUsers";
import { useLeads } from "./hooks/useLeads";
import Link from "next/link";
import StatusBadge from "./components/StatusBadge";
import Spinner from "./components/Spinner";

export default function Dashboard() {
  const { users, loading: usersLoading } = useUsers();
  const { leads, loading: leadsLoading } = useLeads();

  const openLeads = leads.filter((l) => l.status === "OPEN");
  const closedLeads = leads.filter((l) => l.status === "CLOSED");
  const unassignedLeads = openLeads.filter((l) => !l.assignment);

  const totalClosedRevenue = closedLeads.reduce(
    (sum, l) => sum + Number(l.revenue || 0),
    0
  );
  const pipelineRevenue = openLeads.reduce(
    (sum, l) => sum + Number(l.revenue || 0),
    0
  );

  const agentsCount = users.filter((u) => u.role === "AGENT").length;
  const managersCount = users.filter((u) => u.role === "MANAGER").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Sales & Commission Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Real-time pipeline, team management, and automated hierarchy commissions
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/leads" className="btn btn-primary">
            + New Lead
          </Link>
          <Link href="/users" className="btn btn-ghost">
            + New User
          </Link>
        </div>
      </div>

      {/* 4-Stat Metric Grid */}
      <div className="grid-4">
        {/* Card 1: Users */}
        <div className="card stat-card">
          <div className="stat-header">
            <span className="stat-label">Team Members</span>
            <span className="badge badge-role">Team</span>
          </div>
          <div className="stat-value">{usersLoading ? <Spinner size="sm" inline /> : users.length}</div>
          <div className="stat-sub">
            {agentsCount} Agents · {managersCount} Managers
          </div>
        </div>

        {/* Card 2: Open Leads */}
        <div className="card stat-card">
          <div className="stat-header">
            <span className="stat-label">Active Pipeline</span>
            <span className="badge badge-open">Open</span>
          </div>
          <div className="stat-value" style={{ color: "var(--accent-green)" }}>
            {leadsLoading ? <Spinner size="sm" inline /> : openLeads.length}
          </div>
          <div className="stat-sub">
            ₹{pipelineRevenue.toLocaleString()} in progress
          </div>
        </div>

        {/* Card 3: Closed Leads */}
        <div className="card stat-card">
          <div className="stat-header">
            <span className="stat-label">Closed Won</span>
            <span className="badge badge-closed">Settled</span>
          </div>
          <div className="stat-value" style={{ color: "#a5b4fc" }}>
            {leadsLoading ? <Spinner size="sm" inline /> : closedLeads.length}
          </div>
          <div className="stat-sub">
            ₹{totalClosedRevenue.toLocaleString()} total revenue
          </div>
        </div>

        {/* Card 4: Unassigned Leads (Priority Metric) */}
        <div
          className="card stat-card"
          style={{
            borderColor: unassignedLeads.length > 0 ? "rgba(245, 158, 11, 0.4)" : "var(--border)",
            background: unassignedLeads.length > 0 ? "rgba(245, 158, 11, 0.05)" : "var(--bg-card)",
          }}
        >
          <div className="stat-header">
            <span className="stat-label" style={{ color: unassignedLeads.length > 0 ? "var(--accent-amber)" : "var(--text-muted)" }}>
              Unassigned Leads
            </span>
            <span
              className={`badge ${unassignedLeads.length > 0 ? "badge-amber" : "badge-open"}`}
            >
              {unassignedLeads.length > 0 ? "Action Required" : "All Assigned"}
            </span>
          </div>
          <div
            className="stat-value"
            style={{ color: unassignedLeads.length > 0 ? "var(--accent-amber)" : "var(--text-primary)" }}
          >
            {leadsLoading ? <Spinner size="sm" inline /> : unassignedLeads.length}
          </div>
          <div className="stat-sub" style={{ color: unassignedLeads.length > 0 ? "var(--accent-amber)" : "var(--text-secondary)" }}>
            {unassignedLeads.length > 0
              ? `${unassignedLeads.length} open lead${unassignedLeads.length > 1 ? "s" : ""} awaiting rep assignment`
              : "All active deals assigned"}
          </div>
        </div>
      </div>

      {/* Revenue Split Highlights */}
      <div className="grid-2">
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
            <div>
              <span className="stat-label">Closed Revenue Settled</span>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-green)", marginTop: "0.25rem" }}>
                ₹{totalClosedRevenue.toLocaleString()}
              </div>
            </div>
            <span className="badge badge-open">Paid Out</span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
            Distributed according to 50%-30%-20% rules across agent hierarchy, with company retaining base 20% + unallocated shares.
          </p>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
            <div>
              <span className="stat-label">Active Deal Pipeline</span>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent)", marginTop: "0.25rem" }}>
                ₹{pipelineRevenue.toLocaleString()}
              </div>
            </div>
            <span className="badge badge-role">In Flight</span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
            Potential commission pool across all {openLeads.length} open deals: ₹{(pipelineRevenue * 0.8).toLocaleString()} (80%).
          </p>
        </div>
      </div>

      {/* Unassigned Leads Table (Priority Attention Box) */}
      <div className="card" style={{ borderColor: unassignedLeads.length > 0 ? "rgba(245, 158, 11, 0.4)" : "var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h2 className="section-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>⚠️</span> Unassigned Leads Needing Attention
              {unassignedLeads.length > 0 && (
                <span className="badge badge-amber">{unassignedLeads.length}</span>
              )}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", marginTop: "0.2rem" }}>
              Leads must be assigned to an agent or manager before they can be closed and commissions distributed.
            </p>
          </div>
          {unassignedLeads.length > 0 && (
            <Link href="/leads" className="btn btn-ghost btn-sm">
              View All Leads →
            </Link>
          )}
        </div>

        {unassignedLeads.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Deal Title</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {unassignedLeads.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{l.title}</div>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>ID: {l.id}</span>
                    </td>
                    <td style={{ color: "var(--accent-green)", fontWeight: 700 }}>
                      ₹{Number(l.revenue).toLocaleString()}
                    </td>
                    <td>
                      <StatusBadge status={l.status} />
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      {new Date(l.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Link href={`/leads/${l.id}`} className="btn btn-primary btn-sm">
                        Assign Agent →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              padding: "2rem 1rem",
              textAlign: "center",
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius-sm)",
              border: "1px dashed var(--border)",
            }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>🎉</div>
            <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem" }}>
              Zero Unassigned Leads
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
              Every active lead is currently assigned to a sales agent or manager.
            </p>
          </div>
        )}
      </div>

      {/* Recent Leads Pipeline */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>
              Recent Deals Activity
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", marginTop: "0.2rem" }}>
              Latest deals across your sales team
            </p>
          </div>
          <Link href="/leads" className="btn btn-ghost btn-sm">
            View All {leads.length} Deals →
          </Link>
        </div>

        {leadsLoading ? (
          <div className="empty-state"><Spinner label="Loading leads pipeline…" /></div>
        ) : leads.length === 0 ? (
          <div className="empty-state">No leads created yet. Click "+ New Lead" to get started.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Deal Title</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th>Assigned Representative</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 6).map((l) => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{l.title}</div>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {new Date(l.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ color: "var(--accent-green)", fontWeight: 700 }}>
                      ₹{Number(l.revenue).toLocaleString()}
                    </td>
                    <td>
                      <StatusBadge status={l.status} />
                    </td>
                    <td>
                      {l.assignment?.user ? (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                          <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                            {l.assignment.user.name}
                          </span>
                          <span
                            className="badge"
                            style={{
                              fontSize: "0.68rem",
                              padding: "0.1rem 0.45rem",
                              background: l.assignment.user.role === "MANAGER" ? "rgba(245, 158, 11, 0.15)" : "var(--accent-glow)",
                              color: l.assignment.user.role === "MANAGER" ? "var(--accent-amber)" : "#a5b4fc",
                            }}
                          >
                            {l.assignment.user.role}
                          </span>
                        </div>
                      ) : (
                        <span className="badge badge-amber">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <Link href={`/leads/${l.id}`} className="btn btn-ghost btn-sm">
                        View Deal →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
