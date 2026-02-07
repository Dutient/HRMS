"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Sparkles, Download, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { processResume } from "@/app/actions/process-resume";
import { useRouter } from "next/navigation";

interface FileStatus {
  name: string;
  status: "pending" | "processing" | "success" | "error";
  message?: string;
  candidateName?: string;
}

export function UploadZone() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [filesQueue, setFilesQueue] = useState<FileStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value so same files can be selected again
    e.target.value = "";
  };

  const handleFiles = async (files: FileList) => {
    // Validate file count
    if (files.length > 50) {
      alert("Maximum 50 files allowed per upload");
      return;
    }

    // Initialize file status queue
    const initialQueue: FileStatus[] = Array.from(files).map((file) => ({
      name: file.name,
      status: "pending",
    }));

    setFilesQueue(initialQueue);
    setIsProcessing(true);
    setCurrentFileIndex(0);

    // Process files one by one
    for (let i = 0; i < files.length; i++) {
      setCurrentFileIndex(i);

      // Update status to processing
      setFilesQueue((prev) =>
        prev.map((file, index) =>
          index === i ? { ...file, status: "processing" } : file
        )
      );

      // Create FormData for this file
      const formData = new FormData();
      formData.append("file", files[i]);

      try {
        // Process the resume
        const result = await processResume(formData);

        // Update status based on result
        setFilesQueue((prev) =>
          prev.map((file, index) =>
            index === i
              ? {
                  ...file,
                  status: result.success ? "success" : "error",
                  message: result.message,
                  candidateName: result.candidateName,
                }
              : file
          )
        );

        // Small delay between requests to avoid rate limiting
        if (i < files.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        // Handle unexpected errors
        setFilesQueue((prev) =>
          prev.map((file, index) =>
            index === i
              ? {
                  ...file,
                  status: "error",
                  message: "Unexpected error occurred",
                }
              : file
          )
        );
      }
    }

    // Processing complete
    setIsProcessing(false);
    
    // Refresh the page to show new candidates
    router.refresh();
  };

  const successCount = filesQueue.filter((f) => f.status === "success").length;
  const errorCount = filesQueue.filter((f) => f.status === "error").length;
  const totalFiles = filesQueue.length;

  return (
    <div className="space-y-6">
      {/* Main Upload Zone */}
      <Card>
        <CardContent className="p-6 md:p-12">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              rounded-lg border-2 border-dashed p-8 md:p-12 text-center transition-all
              ${
                isDragging
                  ? "border-accent bg-accent/10"
                  : "border-border bg-background hover:border-accent hover:bg-accent/5"
              }
              ${isProcessing ? "opacity-50 pointer-events-none" : ""}
            `}
          >
            <input
              type="file"
              id="file-upload"
              multiple
              accept=".pdf,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isProcessing}
            />
            <div
              onClick={() => {
                if (!isProcessing) {
                  document.getElementById('file-upload')?.click();
                }
              }}
              className={`block space-y-4 ${!isProcessing ? "cursor-pointer" : "cursor-not-allowed"}`}
            >
              <Upload className="mx-auto h-12 md:h-16 w-12 md:w-16 text-text-muted" />
              <div className="space-y-2">
                <h3 className="font-heading text-lg md:text-xl font-semibold text-primary">
                  {isProcessing
                    ? "Processing resumes..."
                    : "Drop files here or click to upload"}
                </h3>
                <p className="text-sm md:text-base text-text-muted">
                  Supports PDF, DOCX, TXT formats • Max 50 files per upload
                </p>
              </div>
              {!isProcessing && (
                <div className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-medium transition-colors mt-4">
                  <Upload className="h-5 w-5" />
                  Select Files
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Display */}
      {filesQueue.length > 0 && (
        <Card className="border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-semibold text-primary">
                Upload Progress
              </h3>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-success/10 text-success">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {successCount} Success
                </Badge>
                {errorCount > 0 && (
                  <Badge variant="secondary" className="bg-danger/10 text-danger">
                    <XCircle className="h-3 w-3 mr-1" />
                    {errorCount} Failed
                  </Badge>
                )}
              </div>
            </div>

            {isProcessing && (
              <div className="mb-4 p-3 rounded-lg bg-accent/5 border border-accent/20">
                <p className="text-sm text-accent font-semibold">
                  Processing {currentFileIndex + 1} of {totalFiles}...
                </p>
              </div>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filesQueue.map((file, index) => (
                <div
                  key={index}
                  className={`
                    p-3 rounded-lg border transition-all
                    ${
                      file.status === "success"
                        ? "bg-success/5 border-success/20"
                        : file.status === "error"
                        ? "bg-danger/5 border-danger/20"
                        : file.status === "processing"
                        ? "bg-accent/5 border-accent/20"
                        : "bg-gray-50 border-gray-200"
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="shrink-0 mt-0.5">
                        {file.status === "processing" && (
                          <Loader2 className="h-5 w-5 text-accent animate-spin" />
                        )}
                        {file.status === "success" && (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        )}
                        {file.status === "error" && (
                          <XCircle className="h-5 w-5 text-danger" />
                        )}
                        {file.status === "pending" && (
                          <FileText className="h-5 w-5 text-text-muted" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary truncate">
                          {file.name}
                        </p>
                        {file.candidateName && (
                          <p className="text-xs text-success mt-0.5">
                            ✓ {file.candidateName}
                          </p>
                        )}
                        {file.message && file.status === "error" && (
                          <p className="text-xs text-danger mt-0.5">
                            {file.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`
                        shrink-0 text-xs
                        ${
                          file.status === "success"
                            ? "bg-success/10 text-success"
                            : file.status === "error"
                            ? "bg-danger/10 text-danger"
                            : file.status === "processing"
                            ? "bg-accent/10 text-accent"
                            : "bg-gray-100 text-gray-600"
                        }
                      `}
                    >
                      {file.status === "pending" && "Pending"}
                      {file.status === "processing" && "Processing..."}
                      {file.status === "success" && "Success"}
                      {file.status === "error" && "Failed"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {!isProcessing && totalFiles > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-text-muted text-center">
                  {successCount > 0 && (
                    <span className="text-success font-semibold">
                      {successCount} resume{successCount !== 1 ? "s" : ""} added successfully!
                    </span>
                  )}
                  {errorCount > 0 && (
                    <span className="text-danger ml-2">
                      {errorCount} failed.
                    </span>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Upload Instructions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-info/20 bg-linear-to-br from-info/5 to-transparent">
          <CardContent className="pt-6 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-info/10">
              <FileText className="h-6 w-6 text-info" />
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-2">
                1. Prepare Files
              </h4>
              <p className="text-sm text-text-muted">
                Ensure all resumes are in PDF, DOCX, or TXT format
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/20 bg-linear-to-br from-warning/5 to-transparent">
          <CardContent className="pt-6 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
              <Sparkles className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-2">
                2. AI Processing
              </h4>
              <p className="text-sm text-text-muted">
                Gemini AI extracts skills, experience, and key information
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/20 bg-linear-to-br from-success/5 to-transparent sm:col-span-2 lg:col-span-1">
          <CardContent className="pt-6 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <Download className="h-6 w-6 text-success" />
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-2">
                3. Auto-Import
              </h4>
              <p className="text-sm text-text-muted">
                Processed candidates appear instantly in your pool
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Tips */}
      <Card className="border-accent/20 bg-linear-to-r from-accent/5 to-transparent">
        <CardContent className="p-4 md:p-6">
          <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Pro Tips for Best Results
          </h4>
          <ul className="space-y-2 text-sm text-text-muted">
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span>Use high-quality, well-formatted resumes for better parsing accuracy</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span>Avoid scanned images - text-based PDFs work best</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span>Files are processed one by one to ensure quality</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span>Duplicates are automatically detected by email address</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
