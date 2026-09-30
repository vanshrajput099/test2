"use client";
import { useState, useEffect, useCallback, useRef } from "react";

export function useLeads(initialParams = {}) {
  const [leads, setLeads] = useState([]);
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
    status: initialParams.status || "ALL",
    search: initialParams.search || "",
    unassigned: initialParams.unassigned || false,
    all: initialParams.all || false,
  });

  // Debounced search: immediate input state + delayed params update
  const [searchInput, setSearchInput] = useState(params.search);
  const searchTimer = useRef(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (params.page) sp.set("page", params.page);
      if (params.limit) sp.set("limit", params.limit);
      if (params.sortBy) sp.set("sortBy", params.sortBy);
      if (params.sortOrder) sp.set("sortOrder", params.sortOrder);
      if (params.status && params.status !== "ALL") sp.set("status", params.status);
      if (params.search) sp.set("search", params.search);
      if (params.unassigned) sp.set("unassigned", "true");
      if (params.all) sp.set("all", "true");

      const res = await fetch(`/api/leads?${sp.toString()}`);
      const json = await res.json();
      if (json.success) {
        setLeads(json.data || []);
        if (json.pagination) {
          setPagination(json.pagination);
        }
      }
    } catch (e) {
      console.error("Failed to fetch leads", e);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

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
  const setStatus = (s) => setParams((prev) => ({ ...prev, status: s, unassigned: false, page: 1 }));
  const setUnassigned = (u) => setParams((prev) => ({ ...prev, unassigned: u, status: "OPEN", page: 1 }));

  const setSearch = (q) => {
    setSearchInput(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setParams((prev) => ({ ...prev, search: q, page: 1 }));
    }, 400);
  };

  const addLead = () => {
    fetchLeads();
  };

  const updateLead = (id, partial) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...partial } : l)));
  };

  return {
    leads,
    pagination,
    loading,
    params,
    searchInput,
    setPage,
    setLimit,
    setSort,
    setStatus,
    setUnassigned,
    setSearch,
    refresh: fetchLeads,
    addLead,
    updateLead,
  };
}
