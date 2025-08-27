"use client";

import React from "react";
import { useUploadFileMutation } from "@/redux/api/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";

export const FileUploadZone = ({
  documentType,
  existingFile,
  required = false,
  disabled = false,
}) => {
  const [uploadFile, { isLoading, error }] = useUploadFileMutation();
  const { toast } = useToast();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await uploadFile({ file, documentType }).unwrap();
      toast({
        title: "Upload Successful",
        description: `${documentType} uploaded successfully.`,
      });
    } catch (err) {
      toast({
        title: "Upload Failed",
        description: err?.data?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2">
      <label className="font-medium">
        {documentType.charAt(0).toUpperCase() + documentType.slice(1)}{" "}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleFileChange}
          disabled={disabled || isLoading}
          className="border p-2 rounded-md"
        />
        {isLoading && <p className="text-sm text-gray-500">Uploading...</p>}
        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> Failed to upload
          </p>
        )}
        {existingFile?.url && (
          <p className="text-sm text-green-500 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" /> Uploaded: {existingFile.name}
          </p>
        )}
      </div>
    </div>
  );
};
