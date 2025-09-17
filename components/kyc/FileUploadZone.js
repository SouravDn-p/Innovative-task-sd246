// Modified FileUploadZone (no major changes needed, as it uses onFileUpload prop)
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, File, X, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const FileUploadZone = ({
  documentType,
  onFileUpload,
  existingFile,
  required = false,
  disabled = false,
}) => {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      if (!file) return;

      setUploadProgress(0);

      try {
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 150);

        // Use the onFileUpload prop (which now handles separate upload and update)
        if (onFileUpload) {
          await onFileUpload(file);
        }

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
    [documentType, toast, onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
    disabled: disabled,
  });

  const viewFile = () => {
    if (existingFile?.url) {
      window.open(existingFile.url, "_blank");
    } else {
      toast({
        title: "File not accessible",
        description: "The uploaded file URL is not available for viewing.",
        variant: "destructive",
      });
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
            Upload a valid {title} in JPEG or PNG format
          </p>
        </div>
      </div>

      {!(existingFile?.url || existingFile?.uploaded) && (
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
                {uploadProgress > 0 ? ( // Changed from isLoading to uploadProgress
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
                        JPEG, PNG • Max 5MB
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(existingFile?.url || existingFile?.uploaded) && (
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <File className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {existingFile?.name || `${documentType} document`}
                  </p>
                  <p className="text-xs text-muted-foreground">Uploaded</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {existingFile?.url && (
                  <Button variant="outline" size="sm" onClick={viewFile}>
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUploadZone;
