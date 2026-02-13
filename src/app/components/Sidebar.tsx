"use client";

type SidebarProps = {
  onAddNode: (type: string) => void;
  onRun: () => void;
  onSave: () => void;   // ✅ add this
};

export default function Sidebar({
  onAddNode,
  onRun,
  onSave,
}: SidebarProps) {
  return (
    <div
      style={{
        width: 220,
        padding: 12,
        borderRight: "1px solid #333",
        background: "#0b0b0b",
        color: "white",
      }}
    >
      <h3>Nodes</h3>

      <button onClick={() => onAddNode("Text")}>Text</button>
      <button onClick={() => onAddNode("Upload Image")}>Upload Image</button>
      <button onClick={() => onAddNode("Upload Video")}>Upload Video</button>
      <button onClick={() => onAddNode("LLM")}>LLM</button>
      <button onClick={() => onAddNode("Crop Image")}>Crop Image</button>
      <button onClick={() => onAddNode("Extract Frame")}>
        Extract Frame
      </button>

      <hr />

      {/* ✅ SAVE BUTTON */}
      <button
        onClick={onSave}
        style={{
          marginTop: 10,
          background: "#3b82f6",
          color: "white",
          padding: 8,
          width: "100%",
        }}
      >
        💾 Save Workflow
      </button>

      <button
        onClick={onRun}
        style={{
          marginTop: 10,
          background: "#22c55e",
          color: "black",
          padding: 8,
          width: "100%",
        }}
      >
        ▶ Run Workflow
      </button>
    </div>
  );
}