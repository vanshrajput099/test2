import { createLead, listLeads } from "../../../services/leadService.js";
import { createLeadSchema } from "../../../validators/leadValidator.js";
import { success, fromError } from "../../../lib/response.js";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || 1;
    const limit = searchParams.get("limit") || 10;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const unassigned = searchParams.get("unassigned") === "true";
    const all = searchParams.get("all") === "true";

    const result = await listLeads({
      page,
      limit,
      sortBy,
      sortOrder,
      status,
      search,
      unassigned,
      all,
    });

    return success(result.data, 200, { pagination: result.pagination });
  } catch (err) {
    return fromError(err);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const data = createLeadSchema.parse(body);
    const lead = await createLead(data);
    return success(lead, 201);
  } catch (err) {
    return fromError(err);
  }
}
