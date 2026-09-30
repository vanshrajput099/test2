import { HIERARCHY_POOL, COMPANY_RATE, LEVEL_RATES } from "../lib/constants.js";
import { withTransaction, lockLeadRow } from "../lib/transaction.js";
import { getHierarchy } from "./hierarchyService.js";
import { ConflictError, ValidationError } from "../lib/errors.js";

/**
 * Calculate per-level amounts from revenue.
 * Missing levels → share goes to company.
 */
function calculateSplits(revenue, hierarchy) {
  const pool = Number(revenue) * HIERARCHY_POOL;
  let companyShare = Number(revenue) * COMPANY_RATE;

  const entries = hierarchy.map((user, idx) => {
    const level = idx + 1;
    return { userId: user.id, amount: pool * LEVEL_RATES[level] };
  });

  // Unallocated levels roll to company
  for (let level = hierarchy.length + 1; level <= 3; level++) {
    companyShare += pool * LEVEL_RATES[level];
  }

  return { entries, companyShare };
}

/**
 * Core close operation — runs inside a serializable transaction.
 * Locks the lead row to prevent concurrent close races.
 */
export async function closeLeadAndDistribute(leadId) {
  return withTransaction(async (tx) => {
    // Step 1: lock row — prevents concurrent closes
    const locked = await lockLeadRow(tx, leadId);
    if (!locked) throw new ValidationError("Lead not found");
    if (locked.status === "CLOSED") {
      throw new ConflictError("Lead is already closed");
    }

    // Step 2: confirm assignment exists
    const assignment = await tx.leadAssignment.findUnique({
      where: { leadId },
    });
    if (!assignment) {
      throw new ValidationError("Lead must be assigned before closing");
    }

    // Step 3: get lead (revenue) + traverse hierarchy
    const lead = await tx.lead.findUnique({ where: { id: leadId } });
    const hierarchy = await getHierarchy(assignment.userId);
    const { entries, companyShare } = calculateSplits(lead.revenue, hierarchy);

    // Step 4: insert commission records (unique constraint prevents dupes)
    await tx.commissionLedger.createMany({ data: entries.map((e) => ({
      ...e, leadId,
    })) });

    // Step 5: insert company share
    await tx.companyLedger.create({ data: { leadId, amount: companyShare } });

    // Step 6: update lead status
    await tx.lead.update({
      where: { id: leadId },
      data: { status: "CLOSED", closedAt: new Date() },
    });

    // Step 7: audit log
    await tx.leadStatusLog.create({
      data: { leadId, fromStatus: "OPEN", toStatus: "CLOSED" },
    });

    return { leadId, entries, companyShare };
  });
}
