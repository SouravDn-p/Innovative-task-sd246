import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useUploadFileMutation } from "@/redux/api/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, File, X, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const FileUploadZone = ({
  documentType,
  existingFile,
  required = false,
  disabled = false,
}) => {
  const [uploadFile, { isLoading, error }] = useUploadFileMutation();
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      if (!file) return;

      setUploadProgress(0);

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 150);

        const response = await uploadFile({ file, documentType }).unwrap();
        clearInterval(progressInterval);
        setUploadProgress(100);

        setTimeout(() => {
          setUploadProgress(0);
          toast({
            title: "Upload Successful",
            description: `${documentType} uploaded successfully.`,
          });
        }, 500);
      } catch (err) {
        setUploadProgress(0);
        toast({
          title: "Upload Failed",
          description: err?.data?.message || "Please try again.",
          variant: "destructive",
        });
      }
    },
    [documentType, uploadFile, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: disabled || isLoading,
  });

  const viewFile = () => {
    if (existingFile?.url) {
      window.open(existingFile.url, "_blank");
    }
  };

  const title = documentType.charAt(0).toUpperCase() + documentType.slice(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium flex items-center gap-2">
            {title}
            {required && <Badge variant="outline">Required</Badge>}
          </h3>
          <p className="text-sm text-muted-foreground">
            Upload a valid {title} in JPEG, PNG, or PDF format
          </p>
        </div>
      </div>

      {!existingFile?.url && (
        <Card
          className={cn(
            "border-2 border-dashed transition-all duration-200",
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-gray-300 bg-gray-50 hover:bg-gray-100",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <CardContent className="p-6">
            <div {...getRootProps()} className="cursor-pointer">
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                {isLoading ? (
                  <div className="w-full space-y-2">
                    <p className="text-sm font-medium">Uploading...</p>
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-xs text-muted-foreground">
                      {uploadProgress}% complete
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        {isDragActive
                          ? "Drop the file here"
                          : "Drag & drop your file here, or click to browse"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPEG, PNG, PDF • Max 5MB
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {existingFile?.url && (
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <File className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{existingFile.name}</p>
                  <p className="text-xs text-muted-foreground">Uploaded</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={viewFile}>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.data?.message || "Upload failed"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FileUploadZone;
