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
  workflow?: {
    name?: string;
  };
  nodeRuns?: NodeRun[];
};

export default function History() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  /* ================================
     Fetch Runs (Safe)
  ================================= */
  async function fetchRuns() {
    try {
      const res = await fetch("/api/runs");
      const json = await res.json();

      // ✅ FIX: Always ensure array
      const runsArray = Array.isArray(json)
        ? json
        : json?.runs ?? [];

      setRuns(runsArray);
    } catch (err) {
      console.error("Failed to load runs:", err);
      setRuns([]);
    } finally {
      setLoading(false);
    }
  }

  /* ================================
     Polling
  ================================= */
  useEffect(() => {
    fetchRuns();

    const interval = setInterval(fetchRuns, 1500);

    return () => clearInterval(interval);
  }, []);

  const statusColor = (status: string) => {
    if (status === "success") return "#22c55e";
    if (status === "failed") return "#ef4444";
    return "#facc15";
  };

  return (
    <div
      style={{
        width: 300,
        padding: 16,
        borderLeft: "1px solid #27272a",
        background: "#0f0f0f",
        color: "#e5e5e5",
        overflowY: "auto",
      }}
    >
      <h3 style={{ marginBottom: 16 }}>History</h3>

      {loading && <p style={{ color: "#9ca3af" }}>Loading...</p>}

      {!loading && runs.length === 0 && (
        <p style={{ color: "#9ca3af" }}>No runs yet</p>
      )}

      {Array.isArray(runs) &&
        runs.map((run) => (
          <div
            key={run.id}
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 10,
              background: "#18181b",
              border: "1px solid #27272a",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              {run.workflow?.name || "Untitled Workflow"}
            </div>

            <div style={{ marginBottom: 4 }}>
              Status:{" "}
              <span
                style={{
                  color: statusColor(run.status),
                  fontWeight: 500,
                }}
              >
                {run.status}
              </span>
            </div>

            <div style={{ fontSize: 12, color: "#a1a1aa" }}>
              {new Date(run.createdAt).toLocaleString()}
            </div>

            <div style={{ marginTop: 10 }}>
              {run.nodeRuns?.map((node) => {
                const isExpanded = expandedNode === node.id;

                return (
                  <div
                    key={node.id}
                    style={{
                      marginTop: 8,
                      paddingLeft: 8,
                      borderLeft: "2px solid #333",
                    }}
                  >
                    <div
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 13,
                      }}
                      onClick={() =>
                        setExpandedNode(isExpanded ? null : node.id)
                      }
                    >
                      <span>{node.nodeId}</span>

                      <span
                        style={{
                          color: statusColor(node.status),
                        }}
                      >
                        {node.status}
                      </span>
                    </div>

                    {isExpanded && node.output && (
                      <div
                        style={{
                          marginTop: 6,
                          padding: 8,
                          background: "#111",
                          borderRadius: 6,
                          fontSize: 12,
                          whiteSpace: "pre-wrap",
                          color: "#d4d4d8",
                        }}
                      >
                        {node.output?.message && (
                          <div style={{ marginTop: 6 }}>
                            {node.output.message}
                          </div>
                        )}

                        {node.output?.cropped_url && (
                          <img
                            src={node.output.cropped_url}
                            style={{
                              marginTop: 6,
                              width: "100%",
                              borderRadius: 6,
                            }}
                          />
                        )}

                        {node.output?.image_url && (
                          <img
                            src={node.output.image_url}
                            style={{
                              marginTop: 6,
                              width: "100%",
                              borderRadius: 6,
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}