import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // ✅ Await params (required in Next 16)
  const { id } = await params;

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