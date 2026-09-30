"use client";
import { useState } from "react";
import ErrorAlert from "./ErrorAlert";
import Spinner from "./Spinner";

export default function LeadForm({ onCreated }) {
  const [form, setForm] = useState({ title: "", revenue: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, revenue: Number(form.revenue) }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setForm({ title: "", revenue: "" });
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
      <h2 className="section-title">Create Lead</h2>
      <ErrorAlert message={err} onDismiss={() => setErr(null)} />
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="form-group">
          <label>Lead Title</label>
          <input id="lead-title" value={form.title} onChange={set("title")} required placeholder="Enterprise Software Deal" />
        </div>
        <div className="form-group">
          <label>Revenue (₹)</label>
          <input id="lead-revenue" type="number" min="1" step="0.01" value={form.revenue}
            onChange={set("revenue")} required placeholder="100000" />
        </div>
        <button id="create-lead-btn" className="btn btn-primary" disabled={loading} type="submit">
          {loading ? <><Spinner size="sm" inline /> Creating…</> : "+ Create Lead"}
        </button>
      </form>
    </div>
  );
}
