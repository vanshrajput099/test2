"use client";
import { useLeads } from "../hooks/useLeads";
import LeadForm from "../components/LeadForm";
import LeadList from "../components/LeadList";

export default function LeadsPage() {
  const leadsHook = useLeads();

  return (
    <div>
      <div className="page-header">
        <h1>Sales Leads</h1>
        <p>Create, assign, and track deal closures with automated commission splits</p>
      </div>
      <div className="leads-page-layout">
        <div style={{ minWidth: 0 }}>
          <LeadForm onCreated={leadsHook.addLead} />
        </div>
        <div style={{ minWidth: 0 }}>
          <LeadList hook={leadsHook} />
        </div>
      </div>
    </div>
  );
}
