"use client";

import { Handle, Position } from "reactflow";
import { useState, useEffect } from "react";

export default function LLMNode({ id, data }: any) {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userMessage, setUserMessage] = useState("");

  useEffect(() => {
    setSystemPrompt(data?.system_prompt || "");
    setUserMessage(data?.user_message || "");
  }, [data?.system_prompt, data?.user_message]);

  const handleSystemChange = (e: any) => {
    const value = e.target.value;
    setSystemPrompt(value);
    data?.onChange?.(id, { system_prompt: value });
  };

  const handleUserChange = (e: any) => {
    const value = e.target.value;
    setUserMessage(value);
    data?.onChange?.(id, { user_message: value });
  };

  const handleModelChange = (e: any) => {
    data?.onChange?.(id, { model: e.target.value });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-80 border">
      <div className="font-semibold mb-2">🤖 LLM Node</div>

      {/* MODEL SELECT */}
      <select
        className="border p-1 w-full mb-2"
        onChange={handleModelChange}
        value={data?.model || "gemini-1.5-flash"}
      >
        <option value="gemini-1.5-flash">Gemini Flash</option>
        <option value="gemini-1.5-pro">Gemini Pro</option>
      </select>

      {/* SYSTEM PROMPT */}
      <textarea
        value={systemPrompt}
        onChange={handleSystemChange}
        placeholder="System prompt..."
        className="w-full border rounded p-2 text-sm mb-2"
      />

      {/* USER MESSAGE */}
      <textarea
        value={userMessage}
        onChange={handleUserChange}
        placeholder="User message..."
        className="w-full border rounded p-2 text-sm mb-2"
      />

      {/* OUTPUT DISPLAY */}
      {data?.lastOutput?.message && (
        <div className="mt-3 text-sm border-t pt-2 whitespace-pre-wrap">
          {data.lastOutput.message}
        </div>
      )}

      {/* INPUT HANDLES */}

     {/* SYSTEM PROMPT INPUT */}
<Handle type="target" position={Position.Left} id="system_prompt" style={{ top: 80 }} />

{/* USER MESSAGE INPUT */}
<Handle type="target" position={Position.Left} id="text" style={{ top: 130 }} />

{/* IMAGE INPUT */}
<Handle type="target" position={Position.Left} id="images" style={{ top: 180 }} />
      {/* OUTPUT HANDLE */}
      <Handle
        type="source"
        position={Position.Right}
        id="message"
      />
    </div>
  );
}