import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/* ===========================
   GET /api/workflows
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

    const workflows = await prisma.workflow.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(workflows);
  } catch (error) {
    console.error("GET WORKFLOWS ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ===========================
   POST /api/workflows
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

    const { id, name, nodes, edges } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Workflow name required" },
        { status: 400 }
      );
    }

    // UPDATE existing workflow
    if (id) {
      const updated = await prisma.workflow.update({
        where: { id },
        data: {
          name,
          nodes,
          edges,
        },
      });

      return NextResponse.json(updated);
    }

    // CREATE new workflow
    const workflow = await prisma.workflow.create({
      data: {
        name,
        userId,
        nodes,
        edges,
      },
    });

    return NextResponse.json(workflow);
  } catch (error) {
    console.error("POST WORKFLOW ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}