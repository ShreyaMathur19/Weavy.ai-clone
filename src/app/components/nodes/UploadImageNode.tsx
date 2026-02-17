"use client";

import { useState } from "react";
import { Handle, Position } from "reactflow";

export default function UploadImageNode({ id, data }: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const result = await res.json();

      if (!result?.url) {
        throw new Error("No URL returned from upload API");
      }

      console.log("Uploaded image URL:", result.url);

      // 🔥 Save into graph store
      data?.onChange?.(id, {
        image_url: result.url,
      });

    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-64 border">
      <div className="font-semibold mb-2 text-sm">
        📤 Upload Image
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
      />

      {loading && (
        <p className="text-xs mt-2 text-blue-600">
          Uploading...
        </p>
      )}

      {error && (
        <p className="text-xs mt-2 text-red-500">
          {error}
        </p>
      )}

      {data?.image_url && (
        <img
          src={data.image_url}
          className="mt-2 rounded border"
          alt="preview"
        />
      )}

      <Handle
        type="source"
        position={Position.Right}
        id="image_url"
      />
    </div>
  );
}