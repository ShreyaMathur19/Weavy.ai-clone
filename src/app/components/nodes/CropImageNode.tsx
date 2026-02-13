"use client";

import { Handle, Position } from "reactflow";

export default function CropImageNode({ id, data }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-64">
      <div className="font-semibold mb-2">Crop Image</div>

      <div className="space-y-2 text-sm">
        <input
          type="number"
          placeholder="X %"
          className="border p-1 w-full"
          onChange={(e) =>
            data.onChange?.(id, { x_percent: Number(e.target.value) })
          }
        />
        <input
          type="number"
          placeholder="Y %"
          className="border p-1 w-full"
          onChange={(e) =>
            data.onChange?.(id, { y_percent: Number(e.target.value) })
          }
        />
        <input
          type="number"
          placeholder="Width %"
          className="border p-1 w-full"
          onChange={(e) =>
            data.onChange?.(id, { width_percent: Number(e.target.value) })
          }
        />
        <input
          type="number"
          placeholder="Height %"
          className="border p-1 w-full"
          onChange={(e) =>
            data.onChange?.(id, { height_percent: Number(e.target.value) })
          }
        />
      </div>

      <Handle type="target" position={Position.Left} id="image_url" />
      <Handle type="source" position={Position.Right} id="cropped_image" />
    </div>
  );
}