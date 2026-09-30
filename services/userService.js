import prisma from "../lib/prisma.js";
import { NotFoundError, ValidationError } from "../lib/errors.js";

const hierarchyInclude = {
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
};

// Create a new user, optionally linking to a manager via user_hierarchy
export async function createUser({ name, email, role, managerId }) {
  const cleanManagerId = managerId?.trim() || null;
  if (cleanManagerId) {
    const manager = await prisma.user.findUnique({ where: { id: cleanManagerId } });
    if (!manager) throw new NotFoundError("Manager not found");
    if (manager.role !== "MANAGER") {
      throw new ValidationError("managerId must refer to a MANAGER role user");
    }
  }

  return prisma.user.create({
    data: {
      name,
      email,
      role,
      hierarchy: cleanManagerId
        ? { create: { managerId: cleanManagerId } }
        : { create: {} },
    },
    include: hierarchyInclude,
  });
}

// List all users with their hierarchy up to 3 levels, with DB pagination and sorting
export async function listUsers({
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
  role,
  search,
  all = false,
} = {}) {
  const where = {};

  if (role && role !== "ALL") {
    where.role = role;
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const allowedSorts = ["name", "email", "role", "createdAt"];
  const orderField = allowedSorts.includes(sortBy) ? sortBy : "createdAt";
  const orderDirection = sortOrder?.toLowerCase() === "asc" ? "asc" : "desc";
  const orderBy = { [orderField]: orderDirection };

  if (all) {
    const data = await prisma.user.findMany({
      where,
      orderBy,
      include: hierarchyInclude,
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
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy,
      skip,
      take,
      include: hierarchyInclude,
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

// Get single user by id with deep hierarchy
export async function getUser(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: hierarchyInclude,
  });
  if (!user) throw new NotFoundError("User not found");
  return user;
}
