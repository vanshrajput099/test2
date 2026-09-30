import { getLead } from "../../../../services/leadService.js";
import { success, fromError } from "../../../../lib/response.js";

export async function GET(_req, { params }) {
  try {
    const { id } = await params;
    const lead = await getLead(id);
    return success(lead);
  } catch (err) {
    return fromError(err);
  }
}
