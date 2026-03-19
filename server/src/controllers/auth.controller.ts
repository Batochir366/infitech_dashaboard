import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res
      .status(400)
      .json({ message: "Хэрэглэгчийн нэр болон нууц үгээ оруулна уу" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    res.status(401).json({ message: "Хэрэглэгч олдсонгүй" });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res
      .status(401)
      .json({
        message: "Хэрэглэгчийн нэр эсвэл нууц үгээ буруу оруулсан байна",
      });
    return;
  }

  const secret = process.env.JWT_SECRET!;
  const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "7d" });

  res.json({
    token,
    user: { id: user.id, email: user.email },
  });
};
