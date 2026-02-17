"use client";

import { Handle, Position } from "reactflow";
import { useState, useEffect } from "react";

type CropImageNodeProps = {
  id: string;
  data: any;
};

const CropImageNode = ({ id, data }: CropImageNodeProps) => {
  const [width, setWidth] = useState<number>(data.width || 400);
  const [height, setHeight] = useState<number>(data.height || 400);

  useEffect(() => {
    data?.onChange?.(id, { width, height });
  }, [width, height]);

  return (
    <div className="bg-white shadow-lg rounded-xl p-4 w-64 border">
      <h3 className="font-semibold mb-2">✂ Crop Image</h3>

      <Handle type="target" position={Position.Left} id="image_url" />

      <div className="mb-2">
        <label className="text-xs text-gray-600">Width</label>
        <input
          type="number"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>

      <div className="mb-2">
        <label className="text-xs text-gray-600">Height</label>
        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>

      <Handle type="source" position={Position.Right} id="image_url" />

      {/* 🔥 Show Cropped Preview */}
      {data?.lastOutput?.cropped_url && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-1">Cropped Preview</p>
          <img
            src={data.lastOutput.cropped_url}
            alt="Cropped"
            className="rounded border"
          />
        </div>
      )}
    </div>
  );
};

export default CropImageNode;