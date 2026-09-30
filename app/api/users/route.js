import { createUser, listUsers } from "../../../services/userService.js";
import { createUserSchema } from "../../../validators/userValidator.js";
import { success, fromError } from "../../../lib/response.js";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || 1;
    const limit = searchParams.get("limit") || 10;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const role = searchParams.get("role") || undefined;
    const search = searchParams.get("search") || undefined;
    const all = searchParams.get("all") === "true";

    const result = await listUsers({
      page,
      limit,
      sortBy,
      sortOrder,
      role,
      search,
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
    const data = createUserSchema.parse(body);
    const user = await createUser(data);
    return success(user, 201);
  } catch (err) {
    return fromError(err);
  }
}
