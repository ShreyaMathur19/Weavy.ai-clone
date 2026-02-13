"use client";

import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Canvas from "@/app/components/Canvas";
import History from "@/app/components/History";

import { useGraphStore } from "@/store/graphStore";
import { planExecution } from "@/execution/planExecution";

export default function HomeClient() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const [currentWorkflowId, setCurrentWorkflowId] =
    useState<string | null>(null);

  // 🔐 Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // 🧠 Graph store
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const setNodes = useGraphStore((s) => s.setNodes);
  const setEdges = useGraphStore((s) => s.setEdges);
  const addNode = useGraphStore((s) => s.addNode);
  const onConnect = useGraphStore((s) => s.onConnect);

  // =============================
  // 💾 SAVE WORKFLOW
  // =============================
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
        const error = await res.json();
        console.error("Save failed:", error);
        return;
      }

      const data = await res.json();
      setCurrentWorkflowId(data.id);

      console.log("Workflow saved:", data.id);
      alert("Workflow saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // =============================
  // ▶ RUN WORKFLOW
  // =============================
  const onRun = async () => {
    try {
      if (!currentWorkflowId) {
        alert("Please save workflow first");
        return;
      }

      if (!nodes.length) {
        alert("Add at least one node");
        return;
      }

      const plan = planExecution(nodes, edges, "full");

      console.log("Execution plan:", plan);

      const res = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          workflowId: currentWorkflowId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Run failed:", error);
        alert("Run failed");
        return;
      }

      const data = await res.json();

      console.log("Run success:", data);
      alert("Workflow executed successfully!");
    } catch (err) {
      console.error("Run error:", err);
    }
  };

  if (!isLoaded) return null;

  return (
    <div style={{ display: "flex", height: "100vh", position: "relative" }}>
      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 100 }}>
        <UserButton afterSignOutUrl="/" />
      </div>

      <Sidebar onAddNode={addNode} onRun={onRun} onSave={onSave} />

      <Canvas
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
        onConnect={onConnect}
      />

      <History />
    </div>
  );
}