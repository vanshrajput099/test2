import { assignLead } from "../../../../../services/assignmentService.js";
import { assignLeadSchema } from "../../../../../validators/assignValidator.js";
import { success, fromError } from "../../../../../lib/response.js";

export async function POST(req, { params }) {
  try {
    const { id: leadId } = await params;
    const body = await req.json();
    const { userId } = assignLeadSchema.parse(body);
    const assignment = await assignLead({ leadId, userId });
    return success(assignment);
  } catch (err) {
    return fromError(err);
  }
}
