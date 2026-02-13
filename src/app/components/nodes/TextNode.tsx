"use client";

import { Handle, Position } from "reactflow";
import { useState } from "react";

export default function TextNode({ id, data }: any) {
  const [value, setValue] = useState(data?.text || "");

  const handleChange = (e: any) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Send value to parent graph store
    data?.onChange?.(id, { text: newValue });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-72">
      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Type your prompt here..."
        className="w-full border rounded p-2 text-sm"
      />

      <Handle type="source" position={Position.Right} id="text" />
    </div>
  );
}