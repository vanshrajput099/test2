import prisma from "./prisma.js";

/**
 * Run fn inside an interactive Prisma transaction.
 * Passes the transaction client (tx) to fn.
 * Sets a 10-second timeout to prevent long locks.
 */
export async function withTransaction(fn) {
  return prisma.$transaction(fn, {
    maxWait: 5000, // max ms to wait for a tx slot
    timeout: 10000, // max ms the tx can run
    isolationLevel: "Serializable",
  });
}

/**
 * Lock a lead row for update within a transaction.
 * Prevents concurrent close requests from racing.
 * Returns the lead row or null.
 */
export async function lockLeadRow(tx, leadId) {
  const rows = await tx.$queryRaw`
    SELECT id, status, "closedAt"
    FROM leads
    WHERE id = ${leadId}
    FOR UPDATE
  `;
  return rows[0] ?? null;
}
