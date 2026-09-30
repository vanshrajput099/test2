"use client";
import { useState, useEffect, useCallback } from "react";

export function useUsers(initialParams = {}) {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [loading, setLoading] = useState(true);

  const [params, setParams] = useState({
    page: initialParams.page || 1,
    limit: initialParams.limit || 10,
    sortBy: initialParams.sortBy || "createdAt",
    sortOrder: initialParams.sortOrder || "desc",
    role: initialParams.role || "ALL",
    search: initialParams.search || "",
    all: initialParams.all || false,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (params.page) sp.set("page", params.page);
      if (params.limit) sp.set("limit", params.limit);
      if (params.sortBy) sp.set("sortBy", params.sortBy);
      if (params.sortOrder) sp.set("sortOrder", params.sortOrder);
      if (params.role && params.role !== "ALL") sp.set("role", params.role);
      if (params.search) sp.set("search", params.search);
      if (params.all) sp.set("all", "true");

      const res = await fetch(`/api/users?${sp.toString()}`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.data || []);
        if (json.pagination) {
          setPagination(json.pagination);
        }
      }
    } catch (e) {
      console.error("Failed to fetch users", e);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const setPage = (p) => setParams((prev) => ({ ...prev, page: p }));
  const setLimit = (l) => setParams((prev) => ({ ...prev, limit: l, page: 1 }));
  const setSort = (field) => {
    setParams((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
      page: 1,
    }));
  };
  const setRole = (r) => setParams((prev) => ({ ...prev, role: r, page: 1 }));
  const setSearch = (q) => setParams((prev) => ({ ...prev, search: q, page: 1 }));

  const addUser = () => {
    fetchUsers();
  };

  return {
    users,
    pagination,
    loading,
    params,
    setPage,
    setLimit,
    setSort,
    setRole,
    setSearch,
    refresh: fetchUsers,
    addUser,
  };
}
