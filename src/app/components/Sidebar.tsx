"use client";

import {
  FileText,
  Image,
  Video,
  Sparkles,
  Crop,
  Film,
  Play,
  Save,
} from "lucide-react";

type SidebarProps = {
  onAddNode: (type: string) => void;
  onRun: () => void;
  onSave: () => void;
  running: boolean;
};

export default function Sidebar({
  onAddNode,
  onRun,
  onSave,
  running,
}: SidebarProps) {
  const buttonStyle =
    "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-neutral-800";

  return (
    <div className="w-64 h-screen bg-neutral-950 text-white border-r border-neutral-800 flex flex-col justify-between p-4">
      
      {/* Top Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-neutral-300">
          Workflow Builder
        </h2>

        <div className="space-y-2">
          <p className="text-xs uppercase text-neutral-500 mb-2">
            Input Nodes
          </p>

          <button
            onClick={() => onAddNode("text")}
            className={buttonStyle}
          >
            <FileText size={16} /> Text
          </button>

          <button
            onClick={() => onAddNode("uploadImage")}
            className={buttonStyle}
          >
            <Image size={16} /> Upload Image
          </button>

          <button
            onClick={() => onAddNode("uploadVideo")}
            className={buttonStyle}
          >
            <Video size={16} /> Upload Video
          </button>

          <p className="text-xs uppercase text-neutral-500 mt-4 mb-2">
            AI
          </p>

          <button
            onClick={() => onAddNode("llm")}
            className={buttonStyle}
          >
            <Sparkles size={16} /> LLM
          </button>

          <p className="text-xs uppercase text-neutral-500 mt-4 mb-2">
            Processing
          </p>

          <button
            onClick={() => onAddNode("cropImage")}
            className={buttonStyle}
          >
            <Crop size={16} /> Crop Image
          </button>

          <button
            onClick={() => onAddNode("extractFrame")}
            className={buttonStyle}
          >
            <Film size={16} /> Extract Frame
          </button>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="space-y-3">
        <button
          onClick={onSave}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition text-white font-medium"
        >
          <Save size={16} /> Save Workflow
        </button>

        <button
          onClick={onRun}
          disabled={running}
          className={`flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg font-medium transition ${
            running
              ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-400 text-black"
          }`}
        >
          <Play size={16} />
          {running ? "Running..." : "Run Workflow"}
        </button>
      </div>
    </div>
  );
}