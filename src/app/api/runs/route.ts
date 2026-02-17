import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { executeWorkflow } from "../../../../trigger/executeWorkflow";

/* ===========================
   GET /api/runs
   Fetch all runs for user
   =========================== */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const runs = await prisma.run.findMany({
      where: { userId },
      include: {
        workflow: true,
        nodeRuns: true, // 🔥 Important for History panel
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(runs);
  } catch (error) {
    console.error("GET RUNS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch runs" },
      { status: 500 }
    );
  }
}

/* ===========================
   POST /api/runs
   Create run + trigger execution
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

    const { workflowId } = await req.json();

    if (!workflowId) {
      return NextResponse.json(
        { error: "Missing workflowId" },
        { status: 400 }
      );
    }

    // Validate workflow ownership
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow || workflow.userId !== userId) {
      return NextResponse.json(
        { error: "Invalid workflow" },
        { status: 403 }
      );
    }

    // 1️⃣ Create run record
    const run = await prisma.run.create({
      data: {
        workflowId,
        userId,
        status: "running",
      },
    });

    // 2️⃣ Trigger background DAG execution
    await executeWorkflow.trigger({
      runId: run.id,
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