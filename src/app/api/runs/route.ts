import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { executeWorkflow } from "../../../../trigger/executeWorkflow";

/* ===========================
   GET /api/runs
   =========================== */
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json([]);
  }

  const runs = await prisma.run.findMany({
    where: { userId },
    include: {
      workflow: true, // 🔥 THIS FIXES THE ERROR
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(runs);
}
 
 

/* ===========================
   POST /api/runs
   =========================== */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { plan, workflowId } = await req.json();

    if (!plan || !workflowId) {
      return NextResponse.json(
        { error: "Missing plan or workflowId" },
        { status: 400 }
      );
    }

    // Validate workflow exists
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow || workflow.userId !== userId) {
      return NextResponse.json(
        { error: "Invalid workflow" },
        { status: 403 }
      );
    }

    // 1️⃣ Create run
    const run = await prisma.run.create({
      data: {
        workflowId,
        userId,
        status: "running",
      },
    });

    // 2️⃣ Execute workflow
    await executeWorkflow(plan, run.id);

    // 3️⃣ Update run to success
    await prisma.run.update({
      where: { id: run.id },
      data: { status: "success" },
    });

    return NextResponse.json({
      success: true,
      runId: run.id,
    });

  } catch (error) {
    console.error("RUN ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}