"use client";

import { Handle, Position } from "reactflow";
import { useState } from "react";

export default function LLMNode({ id, data }: any) {

  const [systemPrompt, setSystemPrompt] = useState(
    data?.system_prompt || ""
  );

  const [userMessage, setUserMessage] = useState(
    data?.user_message || ""
  );

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
    <div className="bg-white p-4 rounded-xl shadow-md w-80">
      <div className="font-semibold mb-2">LLM Node</div>

      {/* Model Select */}
      <select
        className="border p-1 w-full mb-2"
        onChange={handleModelChange}
        defaultValue={data?.model || "gemini-1.5-flash"}
      >
        <option value="gemini-1.5-flash">
          Gemini Flash
        </option>
        <option value="gemini-1.5-pro">
          Gemini Pro
        </option>
      </select>

      {/* System Prompt */}
      <textarea
        value={systemPrompt}
        onChange={handleSystemChange}
        placeholder="System prompt..."
        className="w-full border rounded p-2 text-sm mb-2"
      />

      {/* User Message */}
      <textarea
        value={userMessage}
        onChange={handleUserChange}
        placeholder="User message..."
        className="w-full border rounded p-2 text-sm mb-2"
      />

      {/* Output Display */}
      {data?.output && (
        <div className="mt-3 text-sm border-t pt-2 whitespace-pre-wrap">
          {data.output}
        </div>
      )}

      {/* Input Handles */}
      <Handle type="target" position={Position.Left} id="system_prompt" />
      <Handle type="target" position={Position.Left} id="user_message" />
      <Handle type="target" position={Position.Left} id="images" />

      {/* Output Handle */}
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
}