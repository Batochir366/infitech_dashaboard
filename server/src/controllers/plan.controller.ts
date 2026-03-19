import { Request, Response } from "express";
import prisma from "../lib/prisma";

const normalizeAllowedDomains = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;

  if (Array.isArray(value)) {
    const normalized = value.map((item) => String(item).trim()).filter(Boolean);
    return normalized.length > 0 ? JSON.stringify(normalized) : undefined;
  }

  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      const normalized = parsed.map((item) => String(item).trim()).filter(Boolean);
      return normalized.length > 0 ? JSON.stringify(normalized) : undefined;
    }
  } catch {
    // Fall back to CSV-style legacy payloads.
  }

  const normalized = trimmed
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return normalized.length > 0 ? JSON.stringify(normalized) : undefined;
};

export const getPlans = async (req: Request, res: Response): Promise<void> => {
  const { search, moduleId, page = "1", limit = "10" } = req.query;

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
  const skip = (pageNum - 1) * limitNum;

  const where = {
    ...(moduleId ? { moduleId: parseInt(moduleId as string) } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search as string } },
            { description: { contains: search as string } },
          ],
        }
      : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.plan.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      include: {
        module: { select: { id: true, title: true, code: true } },
        items: true,
      },
    }),
    prisma.plan.count({ where }),
  ]);

  res.json({ data, total, page: pageNum, limit: limitNum });
};

export const getPlanById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = parseInt(req.params.id as string);

  const plan = await prisma.plan.findUnique({
    where: { id },
    include: {
      module: { select: { id: true, title: true, code: true } },
      items: true,
    },
  });

  if (!plan) {
    res.status(404).json({ message: "Тариф олдсонгүй" });
    return;
  }

  res.json(plan);
};

export const createPlan = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    moduleId,
    title,
    description,
    credit,
    price,
    discount,
    isEnabled,
    allowedDomains,
    items,
  } = req.body;
  const normalizedAllowedDomains = normalizeAllowedDomains(allowedDomains);

  if (
    !moduleId ||
    !title ||
    credit === undefined ||
    price === undefined ||
    discount === undefined
  ) {
    res.status(400).json({ message: "Шаардлагатай өгөгдөл оруулна уу" });
    return;
  }

  const moduleExists = await prisma.module.findUnique({
    where: { id: parseInt(moduleId) },
  });

  if (!moduleExists) {
    res.status(404).json({ message: "Модуль олдсонгүй" });
    return;
  }

  const plan = await prisma.$transaction(async (tx) => {
    const created = await tx.plan.create({
      data: {
        moduleId: parseInt(moduleId),
        title,
        description,
        credit: parseInt(credit),
        price: parseFloat(price),
        discount: parseFloat(discount),
        isEnabled: isEnabled ?? true,
        allowedDomains: normalizedAllowedDomains,
      },
    });

    if (Array.isArray(items) && items.length > 0) {
      await tx.planItem.createMany({
        data: (items as string[]).map((itemTitle) => ({
          planId: created.id,
          title: itemTitle,
        })),
      });
    }

    return tx.plan.findUnique({
      where: { id: created.id },
      include: {
        module: { select: { id: true, title: true, code: true } },
        items: true,
      },
    });
  });

  res.status(201).json(plan);
};

export const updatePlan = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const {
    moduleId,
    title,
    description,
    credit,
    price,
    discount,
    isEnabled,
    allowedDomains,
    items,
  } = req.body;
  const normalizedAllowedDomains = normalizeAllowedDomains(allowedDomains);

  const existing = await prisma.plan.findUnique({ where: { id } });

  if (!existing) {
    res.status(404).json({ message: "Тариф олдсонгүй" });
    return;
  }

  const plan = await prisma.$transaction(async (tx) => {
    const updated = await tx.plan.update({
      where: { id },
      data: {
        ...(moduleId !== undefined && { moduleId: parseInt(moduleId) }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(credit !== undefined && { credit: parseInt(credit) }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(discount !== undefined && { discount: parseFloat(discount) }),
        ...(isEnabled !== undefined && { isEnabled }),
        ...(allowedDomains !== undefined && { allowedDomains: normalizedAllowedDomains }),
      },
    });

    if (Array.isArray(items)) {
      await tx.planItem.deleteMany({ where: { planId: id } });
      if (items.length > 0) {
        await tx.planItem.createMany({
          data: (items as string[]).map((itemTitle) => ({
            planId: updated.id,
            title: itemTitle,
          })),
        });
      }
    }

    return tx.plan.findUnique({
      where: { id: updated.id },
      include: {
        module: { select: { id: true, title: true, code: true } },
        items: true,
      },
    });
  });

  res.json(plan);
};

export const deletePlan = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = parseInt(req.params.id as string);

  const existing = await prisma.plan.findUnique({ where: { id } });

  if (!existing) {
    res.status(404).json({ message: "Тариф олдсонгүй" });
    return;
  }

  await prisma.plan.delete({ where: { id } });
  res.status(204).send();
};
