// src/trigger/executeWorkflow.ts

import { task } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";
import { runGemini } from "@/lib/gemini";
import { createAssembly } from "@/lib/transloadit";

/* ======================================================
   DAG ORDER RESOLUTION (Topological Sort)
====================================================== */
function getExecutableNodes(nodes: any[], edges: any[]) {
  const inDegree: Record<string, number> = {};
  const graph: Record<string, string[]> = {};

  nodes.forEach((n) => {
    inDegree[n.id] = 0;
    graph[n.id] = [];
  });

  edges.forEach((e) => {
    graph[e.source] = graph[e.source] || [];
    graph[e.source].push(e.target);
    inDegree[e.target] = (inDegree[e.target] || 0) + 1;
  });

  const queue = Object.keys(inDegree).filter(
    (id) => inDegree[id] === 0
  );

  const order: string[] = [];

  while (queue.length) {
    const current = queue.shift()!;
    order.push(current);

    for (const neighbor of graph[current] || []) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  return order;
}

/* ======================================================
   WORKFLOW EXECUTION
====================================================== */

export const executeWorkflow = task({
  id: "execute-workflow",

  run: async ({ runId }: any) => {
    try {
      const run = await prisma.run.findUnique({
        where: { id: runId },
        include: { workflow: true },
      });

      if (!run?.workflow) {
        throw new Error("Workflow not found");
      }

      const nodes: any[] = run.workflow.nodes as any[];
      const edges: any[] = run.workflow.edges as any[];

      const executionOrder = getExecutableNodes(nodes, edges);
      const nodeOutputs: Record<string, any> = {};

      for (const nodeId of executionOrder) {
        const nodeRun = await prisma.nodeRun.create({
          data: {
            runId,
            nodeId,
            status: "running",
          },
        });

        try {
          const node = nodes.find((n) => n.id === nodeId);
          if (!node) throw new Error("Node not found");

          /* ==============================
             Resolve Inputs From Edges
          ============================== */

          const incomingEdges = edges.filter(
            (e) => e.target === nodeId
          );

          const nodeInputs: any = {};

          for (const edge of incomingEdges) {
            const sourceOutput = nodeOutputs[edge.source];
            if (!sourceOutput) continue;

            if (edge.targetHandle === "images") {
              nodeInputs.images = nodeInputs.images || [];
              nodeInputs.images.push(
                sourceOutput.image_url ||
                  sourceOutput.cropped_url
              );
            }

            if (edge.targetHandle === "image_url") {
              nodeInputs.image_url =
                sourceOutput.image_url ||
                sourceOutput.cropped_url;
            }

            if (edge.targetHandle === "video_url") {
              nodeInputs.video_url =
                sourceOutput.video_url;
            }

            if (edge.targetHandle === "text") {
              nodeInputs.text =
                sourceOutput.message ||
                sourceOutput.text;
            }

            if (edge.targetHandle === "system_prompt") {
              nodeInputs.system_prompt =
                sourceOutput.message ||
                sourceOutput.text;
            }
          }

          let output: any = {};

          /* ==============================
             NODE EXECUTION
          ============================== */

          switch (node.type) {

            /* =========================
               Upload Image
            ========================= */
            case "uploadImage":
              output = {
                image_url: node.data.image_url,
              };
              break;

            /* =========================
               Upload Video
            ========================= */
            case "uploadVideo":
              output = {
                video_url: node.data.video_url,
              };
              break;

            /* =========================
               Crop Image
            ========================= */
            case "cropImage": {
              if (!nodeInputs.image_url) {
                throw new Error("Missing image input");
              }

              const assembly = await createAssembly({
                import: {
                  robot: "/http/import",
                  url: nodeInputs.image_url,
                },
                crop: {
                  robot: "/image/resize",
                  use: "import",
                  width: node.data.width || 400,
                  height: node.data.height || 400,
                  resize_strategy: "crop",
                },
              });

              const cropped =
                assembly?.results?.crop?.[0]?.ssl_url;

              if (!cropped) {
                throw new Error(
                  "Transloadit crop failed"
                );
              }

              output = { cropped_url: cropped };
              break;
            }

            /* =========================
               Extract Frame
            ========================= */
            case "extractFrame": {
              if (!nodeInputs.video_url) {
                throw new Error(
                  "Missing video input"
                );
              }

              const assembly = await createAssembly({
                import: {
                  robot: "/http/import",
                  url: nodeInputs.video_url,
                },
                frame: {
                  robot: "/video/thumbs",
                  use: "import",
                  count: 1,
                },
              });

              const frame =
                assembly?.results?.frame?.[0]?.ssl_url;

              if (!frame) {
                throw new Error(
                  "Frame extraction failed"
                );
              }

              output = { image_url: frame };
              break;
            }

            /* =========================
               LLM NODE (FIXED)
            ========================= */
            case "llm": {
  const response = await runGemini({
    systemPrompt:
      nodeInputs.system_prompt || node.data.system_prompt,

    userMessage:
      nodeInputs.text || node.data.user_message,

    images: (nodeInputs.images || []).filter(Boolean),

    modelName:
      node.data.model || "gemini-1.5-pro",
  });

  output = { message: response };
  break;
}

            default:
              output = {
                message:
                  "Executed successfully",
              };
          }

          nodeOutputs[nodeId] = output;

          await prisma.nodeRun.update({
            where: { id: nodeRun.id },
            data: {
              status: "success",
              output,
            },
          });

        } catch (err: any) {
          await prisma.nodeRun.update({
            where: { id: nodeRun.id },
            data: {
              status: "failed",
              output: {
                error: err.message,
              },
            },
          });

          throw err;
        }
      }

      await prisma.run.update({
        where: { id: runId },
        data: { status: "success" },
      });

    } catch (error) {
      await prisma.run.update({
        where: { id: runId },
        data: { status: "failed" },
      });

      throw error;
    }
  },
});