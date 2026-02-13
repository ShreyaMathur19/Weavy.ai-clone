"use client";

import { Handle, Position } from "reactflow";
import { useEffect, useState } from "react";
import Uppy from "@uppy/core";
import Transloadit from "@uppy/transloadit";

import Dashboard from "@uppy/dashboard";

import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";

export default function UploadImageNode({ id, data }: any) {
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        allowedFileTypes: ["image/*"],
      },
      autoProceed: true,
    })
  );

 useEffect(() => {
  const options = {
    waitForEncoding: true,
    params:{
      template_id: process.env.NEXT_PUBLIC_TRANSLOADIT_TEMPLATE ?? "",
    },
  } as any; // 👈 only cast options

  uppy.use(Transloadit, options);

  const handleComplete = (assembly: any) => {
    const file = assembly?.results?.original?.[0];
    if (!file) return;

    const url = file.ssl_url;
    console.log("Image Uploaded:", url);

    data?.onChange?.(id, { image_url: url });
  };

  uppy.on("transloadit:complete", handleComplete);

  return () => {
    uppy.off("transloadit:complete", handleComplete);
    uppy.cancelAll();
    uppy.destroy();
  };
}, [uppy, id, data]);
  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-72">
      <h3 className="font-semibold mb-2">Upload Image</h3>

  
      {/* Output handle */}
      <Handle type="source" position={Position.Right} id="image_url" />
    </div>
  );
}