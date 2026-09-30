"use client";
import Spinner from "./Spinner";
import Link from "next/link";
import StatusBadge from "./StatusBadge";

function SortHeader({ field, label, currentSort, sortOrder, onSort }) {
  const active = currentSort === field;
  return (
    <th
      onClick={() => onSort && onSort(field)}
      style={{ cursor: onSort ? "pointer" : "default", userSelect: "none" }}
    >
      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
        <span>{label}</span>
        {active ? (
          <span style={{ color: "var(--accent)", fontSize: "0.85rem" }}>
            {sortOrder === "asc" ? "▲" : "▼"}
          </span>
        ) : (
          <span style={{ color: "var(--border-light)", fontSize: "0.7rem" }}>⇅</span>
        )}
      </div>
    </th>
  );
}

export default function LeadList({
  hook,
  leads: propsLeads,
  pagination: propsPagination,
  loading: propsLoading,
}) {
  const leads = hook ? hook.leads : propsLeads || [];
  const pagination = hook ? hook.pagination : propsPagination;
  const loading = hook ? hook.loading : propsLoading || false;
  const params = hook ? hook.params : { status: "ALL", search: "", sortBy: "createdAt", sortOrder: "desc" };

  const currentStatus = params.status || "ALL";
  const isUnassigned = params.unassigned || false;
  const currentSearch = hook ? (hook.searchInput ?? params.search) : (params.search || "");
  const currentSort = params.sortBy || "createdAt";
  const sortOrder = params.sortOrder || "desc";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Search & Filter Toolbar */}
      <div className="toolbar-wrap">
        <div className="search-input-wrap">
          <input
            type="text"
            placeholder="🔍 Search deals by title, agent, ID (DB level)…"
            value={currentSearch}
            onChange={(e) => hook?.setSearch && hook.setSearch(e.target.value)}
            style={{ fontSize: "0.85rem", padding: "0.55rem 0.85rem" }}
          />
        </div>

        <div className="filter-pills">
          <button
            type="button"
            className={`filter-pill ${currentStatus === "ALL" && !isUnassigned ? "active" : ""}`}
            onClick={() => hook?.setStatus && hook.setStatus("ALL")}
          >
            All
          </button>
          <button
            type="button"
            className={`filter-pill ${currentStatus === "OPEN" && !isUnassigned ? "active" : ""}`}
            onClick={() => hook?.setStatus && hook.setStatus("OPEN")}
          >
            Open
          </button>
          <button
            type="button"
            className={`filter-pill ${currentStatus === "CLOSED" ? "active" : ""}`}
            onClick={() => hook?.setStatus && hook.setStatus("CLOSED")}
          >
            Closed
          </button>
          <button
            type="button"
            className={`filter-pill ${isUnassigned ? "active" : ""}`}
            onClick={() => hook?.setUnassigned && hook.setUnassigned(true)}
            style={
              isUnassigned
                ? { background: "var(--accent-amber-glow)", borderColor: "var(--accent-amber)", color: "var(--accent-amber)" }
                : {}
            }
          >
            ⚠️ Unassigned
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card empty-state" style={{ padding: "2.5rem 1rem" }}>
          <Spinner label="Loading deals…" />
        </div>
      ) : leads.length === 0 ? (
        <div className="card empty-state" style={{ padding: "2.5rem 1rem" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>
            No leads match your current DB search or filter criteria.
          </p>
          {(currentSearch || currentStatus !== "ALL" || isUnassigned) && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                hook?.setSearch && hook.setSearch("");
                hook?.setStatus && hook.setStatus("ALL");
              }}
              style={{ display: "inline-flex", width: "auto" }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <SortHeader
                  field="title"
                  label="Deal Title & ID"
                  currentSort={currentSort}
                  sortOrder={sortOrder}
                  onSort={hook?.setSort}
                />
                <SortHeader
                  field="revenue"
                  label="Deal Value"
                  currentSort={currentSort}
                  sortOrder={sortOrder}
                  onSort={hook?.setSort}
                />
                <SortHeader
                  field="status"
                  label="Status"
                  currentSort={currentSort}
                  sortOrder={sortOrder}
                  onSort={hook?.setSort}
                />
                <th>Assigned Rep & Hierarchy</th>
                <SortHeader
                  field="createdAt"
                  label="Created"
                  currentSort={currentSort}
                  sortOrder={sortOrder}
                  onSort={hook?.setSort}
                />
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => {
                const user = l.assignment?.user;
                const mgr = user?.hierarchy?.manager?.name;

                return (
                  <tr key={l.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{l.title}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                        {l.id}
                      </div>
                    </td>
                    <td>
                      <div style={{ color: "var(--accent-green)", fontWeight: 700, fontSize: "0.95rem" }}>
                        ₹{Number(l.revenue).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={l.status} />
                    </td>
                    <td>
                      {user ? (
                        <div>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                            <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                              {user.name}
                            </span>
                            <span
                              className="badge"
                              style={{
                                fontSize: "0.68rem",
                                padding: "0.1rem 0.45rem",
                                background: user.role === "MANAGER" ? "rgba(245, 158, 11, 0.15)" : "var(--accent-glow)",
                                color: user.role === "MANAGER" ? "var(--accent-amber)" : "#a5b4fc",
                              }}
                            >
                              {user.role}
                            </span>
                          </div>
                          {mgr && (
                            <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                              Reports to: {mgr}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="badge badge-amber">⚠️ Unassigned</span>
                      )}
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      {new Date(l.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Link
                        href={`/leads/${l.id}`}
                        className={`btn btn-sm ${!user && l.status === "OPEN" ? "btn-primary" : "btn-ghost"}`}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {!user && l.status === "OPEN" ? "Assign →" : "View →"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* DB Pagination Controls */}
      {pagination && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
            padding: "0.85rem 1rem",
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            fontSize: "0.8rem",
          }}
        >
          <div style={{ color: "var(--text-secondary)" }}>
            Showing {pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            <strong style={{ color: "var(--text-primary)" }}>{pagination.total}</strong> deals
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Per page:</span>
              <select
                value={pagination.limit}
                onChange={(e) => hook?.setLimit && hook.setLimit(Number(e.target.value))}
                style={{ width: "auto", padding: "0.25rem 0.5rem", fontSize: "0.78rem" }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "0.3rem" }}>
              <button
                className="btn btn-ghost btn-sm"
                disabled={!pagination.hasPrev || loading}
                onClick={() => hook?.setPage && hook.setPage(pagination.page - 1)}
                style={{ padding: "0.25rem 0.65rem" }}
              >
                ‹ Prev
              </button>
              <span
                style={{
                  padding: "0.25rem 0.65rem",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {pagination.page} / {pagination.totalPages || 1}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                disabled={!pagination.hasNext || loading}
                onClick={() => hook?.setPage && hook.setPage(pagination.page + 1)}
                style={{ padding: "0.25rem 0.65rem" }}
              >
                Next ›
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
