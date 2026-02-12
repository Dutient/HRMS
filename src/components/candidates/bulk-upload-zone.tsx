"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { uploadResumesAndCreateCandidates } from "@/app/actions/bulk-upload-resumes";
import { useToast } from "@/hooks/use-toast";

interface FileWithPreview extends File {
  preview?: string;
}

interface UploadResult {
  fileName: string;
  success: boolean;
  candidateName?: string;
  message?: string;
}

export function BulkUploadZone() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf"
    );

    if (droppedFiles.length !== e.dataTransfer.files.length) {
      toast({
        title: "Invalid files detected",
        description: "Only PDF files are supported. Non-PDF files were ignored.",
        variant: "destructive",
      });
    }

    setFiles((prev) => [...prev, ...droppedFiles].slice(0, 50));
  }, [toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(
        (file) => file.type === "application/pdf"
      );

      if (selectedFiles.length !== e.target.files.length) {
        toast({
          title: "Invalid files detected",
          description: "Only PDF files are supported. Non-PDF files were ignored.",
          variant: "destructive",
        });
      }

      setFiles((prev) => [...prev, ...selectedFiles].slice(0, 50));
      e.target.value = "";
    }
  }, [toast]);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setProgress(0);
    setUploadResults([]);

    try {
      // Create FormData with all files
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Upload all files
      const results = await uploadResumesAndCreateCandidates(formData);

      clearInterval(progressInterval);
      setProgress(100);
      setUploadResults(results);

      const successCount = results.filter((r) => r.success).length;
      const errorCount = results.filter((r) => !r.success).length;

      if (successCount > 0) {
        toast({
          title: "Upload complete!",
          description: `Successfully uploaded ${successCount} resume${successCount !== 1 ? 's' : ''}${errorCount > 0 ? ` (${errorCount} failed)` : ''}`,
        });
      }

      if (errorCount === results.length) {
        toast({
          title: "Upload failed",
          description: "All uploads failed. Please try again.",
          variant: "destructive",
        });
      }

      // Clear files after successful upload
      if (successCount > 0) {
        setTimeout(() => {
          setFiles([]);
          setUploadResults([]);
        }, 5000);
      }
    } catch (error) {
      toast({
        title: "Upload error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <Card>
        <CardContent className="p-12">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              rounded-lg border-2 border-dashed p-12 text-center transition-all
              ${isDragging ? "border-accent bg-accent/10" : "border-border bg-background hover:border-accent hover:bg-accent/5"}
              ${isUploading ? "pointer-events-none opacity-50" : ""}
            `}
          >
            <input
              type="file"
              id="file-upload"
              multiple
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            
            <Upload className="mx-auto h-16 w-16 text-text-muted mb-4" />
            
            <h3 className="font-heading text-xl font-semibold text-primary mb-2">
              {isUploading ? "Uploading resumes..." : "Drop PDF files here or click to browse"}
            </h3>
            
            <p className="text-text-muted mb-6">
              Maximum 50 files • PDF format only
            </p>

            {!isUploading && (
              <Button
                onClick={() => document.getElementById("file-upload")?.click()}
                className="bg-accent hover:bg-accent-hover"
              >
                <Upload className="mr-2 h-4 w-4" />
                Select Files
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Files List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-primary">
                Selected Files ({files.length})
              </h3>
              {files.length > 50 && (
                <Badge variant="destructive">Max 50 files</Badge>
              )}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-3 rounded-lg border bg-background"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-danger shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-primary truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  {!isUploading && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Upload Button */}
            <div className="mt-6 flex items-center justify-between">
              <Button
                onClick={() => setFiles([])}
                variant="outline"
                disabled={isUploading}
              >
                Clear All
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isUploading || files.length === 0 || files.length > 50}
                className="bg-accent hover:bg-accent-hover"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload {files.length} Resume{files.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">
                  Uploading resumes...
                </span>
                <span className="text-sm text-text-muted">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && !isUploading && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-primary mb-4">Upload Results</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {uploadResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    result.success
                      ? "bg-success/5 border-success/20"
                      : "bg-danger/5 border-danger/20"
                  }`}
                >
                  {result.success ? (
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">
                      {result.fileName}
                    </p>
                    <p className={`text-xs ${result.success ? "text-success" : "text-danger"}`}>
                      {result.success
                        ? `Created: ${result.candidateName}`
                        : result.message || "Upload failed"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
