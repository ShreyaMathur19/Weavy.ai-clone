"use client";

import { useEffect, useState } from "react";

type NodeRun = {
  id: string;
  nodeId: string;
  status: string;
  output: any;
};

type Run = {
  id: string;
  status: string;
  createdAt: string;
  workflow: {
    name: string;
  };
  nodeRuns: NodeRun[];
};

export default function History() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  async function fetchRuns() {
    try {
      const res = await fetch("/api/runs");

      if (!res.ok) {
        console.error("Failed:", res.status);
        setRuns([]);
        return;
      }

      const text = await res.text();

      if (!text) {
        setRuns([]);
        return;
      }

      const data = JSON.parse(text);
      setRuns(data);

    } catch (err) {
      console.error("Failed to load runs:", err);
    } finally {
      setLoading(false);
    }
  }

  fetchRuns();
}, []);
    
  return (
    <div
      style={{
        width: 260,
        padding: 12,
        borderLeft: "1px solid #333",
        background: "#0f0f0f",
        color: "#e5e5e5",
        overflowY: "auto",
      }}
    >
      <h3 style={{ marginBottom: 12, color: "#fafafa" }}>History</h3>

      {loading && <p style={{ color: "#9ca3af" }}>Loading...</p>}

      {!loading && runs.length === 0 && (
        <p style={{ color: "#9ca3af" }}>No runs yet</p>
      )}

      {runs.map((run) => (
        <div
          key={run.id}
          style={{
            marginBottom: 12,
            padding: 10,
            borderRadius: 8,
            background: "#18181b",
            border: "1px solid #27272a",
          }}
        >
          {/* Workflow Name */}
          <div style={{ fontSize: 13, marginBottom: 4 }}>
            <strong>{run.workflow.name}</strong>
          </div>

          {/* Run Status */}
          <div style={{ fontSize: 13 }}>
            <strong>Status:</strong>{" "}
            <span
              style={{
                color:
                  run.status === "success"
                    ? "#22c55e"
                    : run.status === "failed"
                    ? "#ef4444"
                    : "#facc15",
              }}
            >
              {run.status}
            </span>
          </div>

          {/* Time */}
          <div style={{ fontSize: 12, color: "#a1a1aa" }}>
            {new Date(run.createdAt).toLocaleString()}
          </div>

          {/* Node Runs */}
          <div style={{ marginTop: 6 }}>
       {run.nodeRuns?.map((node) => (
              <div
                key={node.id}
                style={{
                  fontSize: 12,
                  marginTop: 4,
                  paddingLeft: 6,
                  borderLeft: "2px solid #333",
                }}
              >
                • {node.nodeId} →{" "}
                <span
                  style={{
                    color:
                      node.status === "success"
                        ? "#22c55e"
                        : node.status === "failed"
                        ? "#ef4444"
                        : "#facc15",
                  }}
                >
                  {node.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}