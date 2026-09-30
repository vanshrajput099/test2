import { closeLeadAndDistribute } from "../../../../../services/commissionService.js";
import { success, fromError } from "../../../../../lib/response.js";

export async function POST(_req, { params }) {
  try {
    const { id: leadId } = await params;
    const result = await closeLeadAndDistribute(leadId);
    return success(result);
  } catch (err) {
    return fromError(err);
  }
}
