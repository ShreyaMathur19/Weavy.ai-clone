import { prisma } from "@/lib/prisma";
import { runGemini } from "@/lib/gemini";

type ExecutionPlan = {
  order: string[];
};

export async function executeWorkflow(
  plan: ExecutionPlan,
  runId: string
) {
  console.log("🔥 EXECUTE WORKFLOW STARTED");
  console.log("PLAN:", plan);

  // Fetch run + workflow once
  const run = await prisma.run.findUnique({
    where: { id: runId },
    include: { workflow: true },
  });

  if (!run?.workflow) {
    throw new Error("Workflow not found");
  }

  const workflowNodes: any[] = run.workflow.nodes as any[];

  for (const nodeId of plan.order) {
    console.log("▶ Executing node:", nodeId);

    const nodeRun = await prisma.nodeRun.create({
      data: {
        runId,
        nodeId,
        status: "running",
      },
    });

    try {
      const currentNode = workflowNodes.find(
        (n) => n.id === nodeId
      );

      if (!currentNode) {
        throw new Error("Node not found in workflow");
      }

      let output: any = {};

      switch (currentNode.type) {

        // =========================
        // TEXT NODE
        // =========================
        case "text":
          output = {
            text: currentNode.data?.text || "",
          };
          break;

        // =========================
        // LLM NODE (REAL GEMINI)
        // =========================
        case "llm": {
          const systemPrompt =
            currentNode.data?.system_prompt || "";

          const userMessage =
            currentNode.data?.user_message || "";

          const finalPrompt = `
${systemPrompt}

${userMessage}
          `;

          const selectedModel =
            currentNode.data?.model || "gemini-1.5-flash";

          console.log("🤖 Sending to Gemini...");
          console.log("Model:", selectedModel);

          const geminiResponse = await runGemini(
            finalPrompt,
            selectedModel
          );

          output = {
            message: geminiResponse,
          };

          // Persist output inside workflow node
          currentNode.data.output = geminiResponse;

          break;
        }

        // =========================
        // IMAGE
        // =========================
        case "uploadImage":
          output = {
            image_url:
              currentNode.data?.image_url || "no-image",
          };
          break;

        // =========================
        // VIDEO
        // =========================
        case "uploadVideo":
          output = {
            video_url:
              currentNode.data?.video_url || "no-video",
          };
          break;

        // =========================
        // CROP
        // =========================
        case "cropImage":
          output = {
            cropped_url: "cropped-image-placeholder",
          };
          break;

        // =========================
        // EXTRACT FRAME
        // =========================
        case "extractFrame":
          output = {
            frame_url: "frame-placeholder",
          };
          break;

        default:
          output = {
            message: `Executed node ${nodeId}`,
          };
      }

      await prisma.nodeRun.update({
        where: { id: nodeRun.id },
        data: {
          status: "success",
          output,
        },
      });

      console.log("✅ Node success:", nodeId);

    } catch (err: any) {
      await prisma.nodeRun.update({
        where: { id: nodeRun.id },
        data: {
          status: "failed",
          output: { error: err.message },
        },
      });

      console.error("❌ Node failed:", nodeId);
      throw err;
    }
  }

  // Save updated workflow nodes (so LLM output persists)
  await prisma.workflow.update({
    where: { id: run.workflowId },
    data: {
      nodes: workflowNodes,
    },
  });

  console.log("✅ WORKFLOW FINISHED");
}