import { getLead } from "../../../services/leadService.js";
import { listUsers } from "../../../services/userService.js";
import LeadDetail from "../../components/LeadDetail";
import Link from "next/link";

// Server component — fetches data on server, passes to client component
export default async function LeadDetailPage({ params }) {
  const { id } = await params;

  let lead, users;
  try {
    const [leadData, userResult] = await Promise.all([
      getLead(id),
      listUsers({ all: true }),
    ]);
    lead = leadData;
    users = Array.isArray(userResult) ? userResult : userResult.data;
  } catch {
    return (
      <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
        <p style={{ color: "var(--accent-red)", marginBottom: "1rem" }}>Lead not found.</p>
        <Link href="/leads" className="btn btn-ghost">← Back to Leads</Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/leads" style={{
          color: "var(--text-muted)",
          textDecoration: "none",
          fontSize: "0.875rem",
        }}>
          ← Back to Leads
        </Link>
      </div>
      <LeadDetail lead={lead} users={users} />
    </div>
  );
}
