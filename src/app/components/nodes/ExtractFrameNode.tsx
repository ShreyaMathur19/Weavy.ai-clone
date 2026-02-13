"use client";

import { Handle, Position } from "reactflow";

export default function ExtractFrameNode({ id, data }: any) {
  return (
    <div style={{
      background: "#1e1e1e",
      color: "white",
      padding: 12,
      borderRadius: 8,
      minWidth: 160
    }}>
      <div style={{ fontWeight: "bold", marginBottom: 6 }}>
        Extract Frame
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}