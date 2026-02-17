"use client";

type SidebarProps = {
  onAddNode: (type: string) => void;
  onRun: () => void;
  onSave: () => void;
  running: boolean; // ✅ Added
};

export default function Sidebar({
  onAddNode,
  onRun,
  onSave,
  running,
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

      <button onClick={() => onAddNode("text")}>Text</button>
      <button onClick={() => onAddNode("uploadImage")}>
        Upload Image
      </button>
      <button onClick={() => onAddNode("uploadVideo")}>
        Upload Video
      </button>
      <button onClick={() => onAddNode("llm")}>LLM</button>
      <button onClick={() => onAddNode("cropImage")}>
        Crop Image
      </button>
      <button onClick={() => onAddNode("extractFrame")}>
        Extract Frame
      </button>

      <hr />

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
        disabled={running} // ✅ Prevent double run
        style={{
          marginTop: 10,
          background: running ? "#9ca3af" : "#22c55e",
          color: "black",
          padding: 8,
          width: "100%",
          cursor: running ? "not-allowed" : "pointer",
        }}
      >
        {running ? "Running..." : "▶ Run Workflow"}
      </button>
    </div>
  );
}