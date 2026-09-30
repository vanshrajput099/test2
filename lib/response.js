import { AppError } from "./errors.js";

// Success response: { success: true, data: {...}, ...meta }
export function success(data, status = 200, meta = {}) {
  const body = { success: true, data };
  if (meta && typeof meta === "object") {
    Object.assign(body, meta);
  }
  return Response.json(body, { status });
}

// Error response: { success: false, error: "message" }
export function error(message, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

// Map any thrown error (AppError or unknown) to a Response
export function fromError(err) {
  if (err instanceof AppError) {
    return error(err.message, err.statusCode);
  }

  // Zod validation errors
  if (err?.name === "ZodError") {
    const msg = err.errors.map((e) => e.message).join(", ");
    return error(msg, 400);
  }

  console.error("[Unhandled error]", err);
  return error("Internal server error", 500);
}
