import prisma from "../lib/prisma.js";

/**
 * Walk the user_hierarchy table up to 3 levels according to business rules:
 *
 * 1. If lead is assigned to an AGENT:
 *    - Level 1: The assigned agent (50% of 80% = 40%)
 *    - Level 2: Agent's manager (30% of 80% = 24%)
 *    - Level 3: Manager of Level 2 (20% of 80% = 16%)
 *
 * 2. If lead is assigned to a MANAGER:
 *    - Level 1: The assigned manager (50% of 80% = 40%)
 *    - Level 2: Manager of that manager (30% of 80% = 24%)
 *    - Level 3: DOES NOT EXIST. The 16% share rolls to the company.
 *
 * Uses user_hierarchy, NOT the users table — identity and reporting structure stay separate.
 */
export async function getHierarchy(userId) {
  const hierarchy = [];

  // Level 1: the assigned user (agent or manager)
  const level1 = await prisma.user.findUnique({ where: { id: userId } });
  if (!level1) return hierarchy;
  hierarchy.push(level1);

  // Level 2: manager of the assigned user
  const h1 = await prisma.userHierarchy.findUnique({
    where: { userId },
    include: { manager: true },
  });
  if (!h1?.manager) return hierarchy;
  hierarchy.push(h1.manager);

  // If assigned user is a MANAGER:
  // Manager of that manager is Level 2, and there is NO Level 3.
  // Level 3's 16% share rolls to company.
  if (level1.role === "MANAGER") {
    return hierarchy;
  }

  // Level 3: manager of Level 2 (only applies if assigned user is an AGENT)
  const h2 = await prisma.userHierarchy.findUnique({
    where: { userId: h1.manager.id },
    include: { manager: true },
  });
  if (!h2?.manager) return hierarchy;
  hierarchy.push(h2.manager);

  return hierarchy;
}
