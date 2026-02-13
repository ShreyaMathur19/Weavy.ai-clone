import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // ✅ FIX: await params from context
  const { id } = await context.params;

  const run = await prisma.run.findUnique({
    where: { id },
    include: {
      nodeRuns: true,
      workflow: true,
    },
  });

  if (!run || run.userId !== userId) {
    return NextResponse.json(
      { error: "Run not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(run);
}