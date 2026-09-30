"use client";

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

export default function UserList({
  hook,
  users: propsUsers,
  pagination: propsPagination,
  loading: propsLoading,
}) {
  const users = hook ? hook.users : propsUsers || [];
  const pagination = hook ? hook.pagination : propsPagination;
  const loading = hook ? hook.loading : propsLoading || false;
  const params = hook ? hook.params : { role: "ALL", search: "", sortBy: "createdAt", sortOrder: "desc" };

  const currentRole = params.role || "ALL";
  const currentSearch = params.search || "";
  const currentSort = params.sortBy || "createdAt";
  const sortOrder = params.sortOrder || "desc";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Search & Filter Toolbar */}
      <div className="toolbar-wrap">
        <div className="search-input-wrap">
          <input
            type="text"
            placeholder="🔍 Search users by name, email (DB level)…"
            value={currentSearch}
            onChange={(e) => hook?.setSearch && hook.setSearch(e.target.value)}
            style={{ fontSize: "0.85rem", padding: "0.55rem 0.85rem" }}
          />
        </div>

        <div className="filter-pills">
          <button
            type="button"
            className={`filter-pill ${currentRole === "ALL" ? "active" : ""}`}
            onClick={() => hook?.setRole && hook.setRole("ALL")}
          >
            All
          </button>
          <button
            type="button"
            className={`filter-pill ${currentRole === "AGENT" ? "active" : ""}`}
            onClick={() => hook?.setRole && hook.setRole("AGENT")}
          >
            Agents
          </button>
          <button
            type="button"
            className={`filter-pill ${currentRole === "MANAGER" ? "active" : ""}`}
            onClick={() => hook?.setRole && hook.setRole("MANAGER")}
          >
            Managers
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card empty-state" style={{ padding: "2.5rem 1rem" }}>
          Loading team members from database…
        </div>
      ) : users.length === 0 ? (
        <div className="card empty-state" style={{ padding: "2.5rem 1rem" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>
            No users match your current DB search or filter criteria.
          </p>
          {(currentSearch || currentRole !== "ALL") && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                hook?.setSearch && hook.setSearch("");
                hook?.setRole && hook.setRole("ALL");
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
                  field="name"
                  label="User"
                  currentSort={currentSort}
                  sortOrder={sortOrder}
                  onSort={hook?.setSort}
                />
                <SortHeader
                  field="email"
                  label="Email"
                  currentSort={currentSort}
                  sortOrder={sortOrder}
                  onSort={hook?.setSort}
                />
                <SortHeader
                  field="role"
                  label="Role"
                  currentSort={currentSort}
                  sortOrder={sortOrder}
                  onSort={hook?.setSort}
                />
                <th>Reporting Hierarchy</th>
                <SortHeader
                  field="createdAt"
                  label="Joined"
                  currentSort={currentSort}
                  sortOrder={sortOrder}
                  onSort={hook?.setSort}
                />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const l2Manager = u.hierarchy?.manager;
                const l3Manager = l2Manager?.hierarchy?.manager;

                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: u.role === "MANAGER" ? "rgba(245, 158, 11, 0.2)" : "var(--accent-glow)",
                            color: u.role === "MANAGER" ? "var(--accent-amber)" : "var(--accent)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>{u.name}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                            {u.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: u.role === "MANAGER" ? "rgba(245, 158, 11, 0.15)" : "var(--accent-glow)",
                          color: u.role === "MANAGER" ? "var(--accent-amber)" : "var(--accent)",
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.role === "MANAGER" ? (
                        l2Manager ? (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                            <span
                              className="badge"
                              style={{
                                background: "rgba(108, 99, 255, 0.15)",
                                color: "#a5b4fc",
                                fontSize: "0.75rem",
                                padding: "0.15rem 0.5rem",
                              }}
                              title={`Reports to Manager: ${l2Manager.name}`}
                            >
                              L2: {l2Manager.name}
                            </span>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                              (Manager deals: L2 only, no L3)
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: "var(--accent-amber)", fontSize: "0.78rem", fontWeight: 500 }}>
                            👑 Top Level Manager (No L2/L3)
                          </span>
                        )
                      ) : l2Manager ? (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                          <span
                            className="badge"
                            style={{
                              background: "rgba(108, 99, 255, 0.15)",
                              color: "#a5b4fc",
                              fontSize: "0.75rem",
                              padding: "0.15rem 0.5rem",
                            }}
                            title={`Level 2 Manager: ${l2Manager.name}`}
                          >
                            L2: {l2Manager.name}
                          </span>
                          {l3Manager ? (
                            <>
                              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>➔</span>
                              <span
                                className="badge"
                                style={{
                                  background: "rgba(34, 197, 94, 0.15)",
                                  color: "#86efac",
                                  fontSize: "0.75rem",
                                  padding: "0.15rem 0.5rem",
                                }}
                                title={`Level 3 Manager's Manager: ${l3Manager.name}`}
                              >
                                L3: {l3Manager.name}
                              </span>
                            </>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginLeft: "0.2rem" }}>
                              (No L3)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                          Direct Agent (No L2/L3)
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      {new Date(u.createdAt).toLocaleDateString()}
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
            <strong style={{ color: "var(--text-primary)" }}>{pagination.total}</strong> team members
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
