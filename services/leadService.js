import prisma from "../lib/prisma.js";
import { NotFoundError } from "../lib/errors.js";

const userHierarchyInclude = {
  include: {
    hierarchy: {
      include: {
        manager: {
          include: {
            hierarchy: {
              include: {
                manager: true,
              },
            },
          },
        },
      },
    },
  },
};

export async function createLead({ title, revenue }) {
  return prisma.lead.create({
    data: { title, revenue },
  });
}

export async function listLeads({
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
  status,
  search,
  unassigned = false,
  all = false,
} = {}) {
  const where = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (unassigned) {
    where.status = "OPEN";
    where.assignment = null;
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { id: { contains: q, mode: "insensitive" } },
      { assignment: { user: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const allowedSorts = ["title", "revenue", "status", "createdAt"];
  const orderField = allowedSorts.includes(sortBy) ? sortBy : "createdAt";
  const orderDirection = sortOrder?.toLowerCase() === "asc" ? "asc" : "desc";
  const orderBy = { [orderField]: orderDirection };

  if (all) {
    const data = await prisma.lead.findMany({
      where,
      orderBy,
      include: {
        assignment: { include: { user: userHierarchyInclude } },
      },
    });
    return {
      data,
      pagination: {
        page: 1,
        limit: data.length,
        total: data.length,
        totalPages: 1,
        hasPrev: false,
        hasNext: false,
        sortBy: orderField,
        sortOrder: orderDirection,
      },
    };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * take;

  const [total, data] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        assignment: { include: { user: userHierarchyInclude } },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / take) || 1;

  return {
    data,
    pagination: {
      page: pageNum,
      limit: take,
      total,
      totalPages,
      hasPrev: pageNum > 1,
      hasNext: pageNum < totalPages,
      sortBy: orderField,
      sortOrder: orderDirection,
    },
  };
}

export async function getLead(id) {
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignment: { include: { user: userHierarchyInclude } },
      commissions: { include: { user: true } },
      companyLedger: true,
      statusLogs: { orderBy: { changedAt: "asc" } },
    },
  });
  if (!lead) throw new NotFoundError("Lead not found");
  return lead;
}
