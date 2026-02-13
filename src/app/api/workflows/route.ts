import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET → Fetch workflows
 */
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workflows = await prisma.workflow.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(workflows);
}

/**
 * POST → Create workflow
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, nodes, edges } = await req.json();

  if (!name || !nodes || !edges) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const workflow = await prisma.workflow.create({
    data: {
      name,
      nodes,
      edges,
      userId,
    },
  });

  return NextResponse.json(workflow);
}