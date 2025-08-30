"use client";

import React from "react";
import { useUploadFileMutation } from "@/redux/api/api";

export const FileUpload = () => {
  const [uploadFile, { isLoading, data, error }] = useUploadFileMutation();

  const handleFileChange = (documentType) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await uploadFile({ file, documentType }).unwrap();
      console.log(`${documentType} uploaded:`, response);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {isLoading && <p>Uploading...</p>}
      {error && <p>Failed to upload.</p>}
      {data && <p>Uploaded to: {data.url}</p>}
    </div>
  );
};
