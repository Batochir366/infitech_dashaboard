import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getDomains = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { search, page = "1", limit = "100" } = req.query;

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
  const skip = (pageNum - 1) * limitNum;

  const where = search ? { name: { contains: search as string } } : {};

  const [data, total] = await prisma.$transaction([
    prisma.domain.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
    }),
    prisma.domain.count({ where }),
  ]);

  res.json({ data, total, page: pageNum, limit: limitNum });
};

export const getDomainById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = parseInt(req.params.id as string);

  const domain = await prisma.domain.findUnique({ where: { id } });

  if (!domain) {
    res.status(404).json({ message: "Домэйн олдсонгүй" });
    return;
  }

  res.json(domain);
};

export const createDomain = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { name, isEnabled } = req.body;

  if (!name) {
    res.status(400).json({ message: "Домэйн нэр оруулна уу" });
    return;
  }

  const existing = await prisma.domain.findUnique({ where: { name } });
  if (existing) {
    res.status(409).json({ message: "Энэ домэйн аль хэдийн бүртгэлтэй байна" });
    return;
  }

  const domain = await prisma.domain.create({
    data: {
      name,
      isEnabled: isEnabled ?? true,
    },
  });

  res.status(201).json(domain);
};

export const updateDomain = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const { name, isEnabled } = req.body;

  const existing = await prisma.domain.findUnique({ where: { id } });

  if (!existing) {
    res.status(404).json({ message: "Домэйн олдсонгүй" });
    return;
  }

  if (name && name !== existing.name) {
    const duplicate = await prisma.domain.findUnique({ where: { name } });
    if (duplicate) {
      res
        .status(409)
        .json({ message: "Энэ домэйн аль хэдийн бүртгэлтэй байна" });
      return;
    }
  }

  const domain = await prisma.domain.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(isEnabled !== undefined && { isEnabled }),
    },
  });

  res.json(domain);
};

export const deleteDomain = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = parseInt(req.params.id as string);

  const existing = await prisma.domain.findUnique({ where: { id } });

  if (!existing) {
    res.status(404).json({ message: "Домэйн олдсонгүй" });
    return;
  }

  await prisma.domain.delete({ where: { id } });
  res.status(204).send();
};
