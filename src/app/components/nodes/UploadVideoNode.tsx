"use client";

import { Handle, Position } from "reactflow";
import { useEffect, useState } from "react";

import Uppy from "@uppy/core";
import Transloadit from "@uppy/transloadit";

import Dashboard from "@uppy/dashboard";

import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";

export default function UploadVideoNode({ id, data }: any) {
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        allowedFileTypes: ["video/*"],
      },
      autoProceed: true,
    })
  );

  useEffect(() => {
    uppy.use(
      Transloadit,
      {
        waitForEncoding: true,
        params: {
          template_id:
            process.env.NEXT_PUBLIC_TRANSLOADIT_TEMPLATE || "",
        },
      } as any // 🔥 fixes TypeScript red error
    );

    const handleComplete = (assembly: any) => {
      const file = assembly?.results?.original?.[0];
      if (!file) return;

      const url = file.ssl_url;

      console.log("🎥 Video Uploaded:", url);

      data?.onChange?.(id, { video_url: url });
    };

    uppy.on("transloadit:complete", handleComplete);

    return () => {
      uppy.off("transloadit:complete", handleComplete);
      uppy.destroy();
    };
  }, [uppy, id, data]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-72">
      <h3 className="font-semibold mb-2">Upload Video</h3>

 

      <Handle type="source" position={Position.Right} id="video_url" />
    </div>
  );
}