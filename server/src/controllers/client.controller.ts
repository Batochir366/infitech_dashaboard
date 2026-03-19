import { Request, Response } from "express";

import prisma from "../lib/prisma";
import { ClientStatus } from "../generated/prisma/enums";

export const getClients = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { search, status, page = "1", limit = "10" } = req.query;

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
  const skip = (pageNum - 1) * limitNum;

  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search as string } },
            { domain: { is: { name: { contains: search as string } } } },
            { phoneNumber: { contains: search as string } },
            { regNumber: { contains: search as string } },
          ],
        }
      : {}),
    ...(status ? { status: status as ClientStatus } : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.client.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      include: { domain: { select: { id: true, name: true } } },
    }),
    prisma.client.count({ where }),
  ]);

  res.json({ data, total, page: pageNum, limit: limitNum });
};

export const getClientById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const client = await prisma.client.findUnique({
    where: { id },
    include: { domain: { select: { id: true, name: true } } },
  });

  if (!client) {
    res.status(404).json({ message: "Харилцагч олдсонгүй" });
    return;
  }

  res.json(client);
};

export const createClient = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    name,
    invoice,
    paymentDate,
    status,
    domainId,
    notes,
    regNumber,
    phoneNumber,
    phoneNumber2,
    email,
    productType,
  } = req.body;

  if (!name || invoice === undefined || !paymentDate || !status || !phoneNumber) {
    res.status(400).json({ message: "Шаардлагатай өгөгдөл оруулна уу" });
    return;
  }

  const client = await prisma.client.create({
    data: {
      name,
      invoice: parseFloat(invoice),
      paymentDate,
      status,
      domainId: domainId ? parseInt(domainId) : null,
      notes,
      regNumber,
      phoneNumber,
      phoneNumber2,
      email,
      productType,
    },
    include: { domain: { select: { id: true, name: true } } },
  });

  res.status(201).json(client);
};

export const updateClient = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const {
    name,
    invoice,
    paymentDate,
    status,
    domainId,
    notes,
    regNumber,
    phoneNumber,
    phoneNumber2,
    email,
    productType,
  } = req.body;

  const existing = await prisma.client.findUnique({ where: { id } });

  if (!existing) {
    res.status(404).json({ message: "Харилцагч олдсонгүй" });
    return;
  }

  const client = await prisma.client.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(invoice !== undefined && { invoice: parseFloat(invoice) }),
      ...(paymentDate !== undefined && { paymentDate }),
      ...(status !== undefined && { status }),
      ...(domainId !== undefined && { domainId: domainId ? parseInt(domainId) : null }),
      ...(notes !== undefined && { notes }),
      ...(regNumber !== undefined && { regNumber }),
      ...(phoneNumber !== undefined && { phoneNumber }),
      ...(phoneNumber2 !== undefined && { phoneNumber2 }),
      ...(email !== undefined && { email }),
      ...(productType !== undefined && { productType }),
    },
    include: { domain: { select: { id: true, name: true } } },
  });

  res.json(client);
};

export const deleteClient = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = parseInt(req.params.id as string);

  const existing = await prisma.client.findUnique({ where: { id } });

  if (!existing) {
    res.status(404).json({ message: "Харилцагч олдсонгүй" });
    return;
  }

  await prisma.client.delete({ where: { id } });
  res.status(204).send();
};
