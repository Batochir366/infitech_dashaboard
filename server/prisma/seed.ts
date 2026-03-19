import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma";

async function main() {
  const hashed = await bcrypt.hash("password123", 10);
  const user = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: hashed,
    },
  });
  console.log("Created user:", user.email);
}

main().catch(console.error);
