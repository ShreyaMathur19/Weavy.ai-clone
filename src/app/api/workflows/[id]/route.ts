import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const workflow = await prisma.workflow.findUnique({
    where: { id },
  });

  if (!workflow || workflow.userId !== userId) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(workflow);
}