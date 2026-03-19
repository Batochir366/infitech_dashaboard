import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getModules = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { search, page = "1", limit = "10" } = req.query;

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
  const skip = (pageNum - 1) * limitNum;

  const where = search
    ? {
        OR: [
          { title: { contains: search as string } },
          { code: { contains: search as string } },
        ],
      }
    : {};

  const [data, total] = await prisma.$transaction([
    prisma.module.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      include: { plans: { select: { id: true } } },
    }),
    prisma.module.count({ where }),
  ]);

  res.json({ data, total, page: pageNum, limit: limitNum });
};

export const getModuleById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = parseInt(req.params.id as string);

  const module = await prisma.module.findUnique({
    where: { id },
    include: { plans: { include: { items: true } } },
  });

  if (!module) {
    res.status(404).json({ message: "Модуль олдсонгүй" });
    return;
  }

  res.json(module);
};

export const createModule = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { title, code, isEnabled } = req.body;

  if (!title || !code) {
    res.status(400).json({ message: "Гарчиг болон код оруулна уу" });
    return;
  }

  const module = await prisma.module.create({
    data: {
      title,
      code,
      isEnabled: isEnabled ?? true,
    },
  });

  res.status(201).json(module);
};

export const updateModule = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const { title, code, isEnabled } = req.body;

  const existing = await prisma.module.findUnique({ where: { id } });

  if (!existing) {
    res.status(404).json({ message: "Модуль олдсонгүй" });
    return;
  }

  const module = await prisma.module.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(code !== undefined && { code }),
      ...(isEnabled !== undefined && { isEnabled }),
    },
  });

  res.json(module);
};

export const deleteModule = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = parseInt(req.params.id as string);

  const existing = await prisma.module.findUnique({ where: { id } });

  if (!existing) {
    res.status(404).json({ message: "Модуль олдсонгүй" });
    return;
  }

  await prisma.module.delete({ where: { id } });
  res.status(204).send();
};
