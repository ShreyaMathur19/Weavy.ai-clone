"use client";

import { Handle, Position } from "reactflow";
import { useState, useEffect } from "react";

export default function TextNode({ id, data }: any) {
  const [text, setText] = useState("");

  useEffect(() => {
    setText(data?.text || "");
  }, [data?.text]);

  const handleChange = (e: any) => {
    const value = e.target.value;
    setText(value);

    data?.onChange?.(id, { text: value });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-72 border">
      <div className="font-semibold mb-2">
        {data?.label || "Text Node"}
      </div>

      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Enter text..."
        className="w-full border rounded p-2 text-sm"
      />

      {/* 🔥 Two Output Handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="text"
        style={{ top: 40 }}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="system_prompt"
        style={{ top: 80 }}
      />
    </div>
  );
}