import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null; // ✅ DO NOT throw
  }

  let user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { id: userId },
    });
  }

  return user;
}