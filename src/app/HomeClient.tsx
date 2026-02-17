"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Canvas from "@/app/components/Canvas";
import History from "@/app/components/History";

import { useGraphStore } from "@/store/graphStore";

export default function HomeClient() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const [currentWorkflowId, setCurrentWorkflowId] =
    useState<string | null>(null);

  const [running, setRunning] = useState(false);

  /* ================================
     Auth Redirect
  ================================= */

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  /* ================================
     Graph Store
  ================================= */

  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const setNodes = useGraphStore((s) => s.setNodes);
  const setEdges = useGraphStore((s) => s.setEdges);
  const addNode = useGraphStore((s) => s.addNode);
  const onConnect = useGraphStore((s) => s.onConnect);

  /* ================================
     Inject onChange into nodes
  ================================= */

  const onNodeDataChange = useCallback(
    (id: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...newData,
                  onChange: onNodeDataChange,
                },
              }
            : node
        )
      );
    },
    [setNodes]
  );

  const enhancedNodes = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onChange: onNodeDataChange,
    },
  }));

  /* ================================
     SAVE WORKFLOW
  ================================= */

  const onSave = async () => {
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentWorkflowId,
          name: "My Workflow",
          nodes,
          edges,
        }),
      });

      if (!res.ok) {
        alert("Failed to save workflow");
        return;
      }

      const data = await res.json();
      setCurrentWorkflowId(data.id);

      alert("Workflow saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  /* ================================
     RUN WORKFLOW (Safe Polling)
  ================================= */

const onRun = async () => {
  if (!currentWorkflowId || running) return;

  try {
    setRunning(true);

    // 1️⃣ Create Run
    const res = await fetch("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflowId: currentWorkflowId }),
    });

    if (!res.ok) {
      alert("Failed to start run");
      setRunning(false);
      return;
    }

    const runData = await res.json();
    const runId = runData.runId;

    // 2️⃣ Poll Run Status
    let attempts = 0;
    const maxAttempts = 60;

    let finalRun: any = null;

    while (attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 1500));

      const runRes = await fetch(`/api/runs/${runId}`);
      finalRun = await runRes.json();

      if (finalRun.status === "success" || finalRun.status === "failed") {
        break;
      }

      attempts++;
    }

    if (!finalRun || finalRun.status !== "success") {
      alert("Run failed");
      return;
    }

    // 3️⃣ Inject node outputs into current graph
    const updatedNodes = nodes.map((node: any) => {
      const nodeRun = finalRun.nodeRuns?.find(
        (nr: any) => nr.nodeId === node.id
      );

      if (!nodeRun) return node;

      return {
        ...node,
        data: {
          ...node.data,
          lastOutput: nodeRun.output, // 🔥 THIS IS THE KEY
        },
      };
    });

    setNodes(updatedNodes);

  } catch (err) {
    console.error(err);
    alert("Run failed");
  } finally {
    setRunning(false);
  }
};
  if (!isLoaded) return null;

  return (
    <div style={{ display: "flex", height: "100vh", position: "relative" }}>
      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 100 }}>
        <UserButton afterSignOutUrl="/" />
      </div>

      <Sidebar
        onAddNode={addNode}
        onRun={onRun}
        onSave={onSave}
        running={running}
      />

      <Canvas
        nodes={enhancedNodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
        onConnect={onConnect}
      />

      <History />
    </div>
  );
}