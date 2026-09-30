import prisma from "../lib/prisma.js";
import { NotFoundError, ValidationError } from "../lib/errors.js";

export async function assignLead({ leadId, userId }) {
  // Validate lead exists and is OPEN
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new NotFoundError("Lead not found");
  if (lead.status !== "OPEN") {
    throw new ValidationError("Cannot assign a closed lead");
  }

  // Validate user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError("User not found");

  // Upsert: update if already assigned, else create
  // The @unique on leadId prevents double-assignment at DB level
  return prisma.leadAssignment.upsert({
    where: { leadId },
    update: { userId },
    create: { leadId, userId },
    include: { user: true, lead: true },
  });
}
