"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X, Loader2, Briefcase, Hash, Globe, CheckCircle2 } from "lucide-react";
import { useUpload } from "@/context/UploadContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

interface FileWithPreview extends File {
  preview?: string;
}

export function BulkUploadZone() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { startUpload, isUploading, progress, uploadedCount, totalCount, filesQueue } = useUpload();
  const { toast } = useToast();
  const router = useRouter();

  // Metadata state
  const [position, setPosition] = useState("");
  const [jobOpening, setJobOpening] = useState("");
  const [domain, setDomain] = useState("");

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

    // Start the upload using context
    await startUpload(files, {
      position: position || undefined,
      job_opening: jobOpening || undefined,
      domain: domain || undefined,
    });

    toast({
      title: "Upload complete!",
      description: `Successfully processed ${files.length} files.`,
    });

    // Clear local file state after view confirmation or just keep them to show status?
    // For now, let's keep them and maybe allow user to clear or navigate
    setFiles([]);

    // Optional: Auto navigate after a delay if desired, or let user click "View Candidates"
    // setTimeout(() => {
    //   router.push("/candidates");
    // }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <Card>
        <CardContent className="p-8 space-y-6">
          {/* Metadata Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position" className="text-sm font-medium">Position</Label>
              <div className="relative">
                <Briefcase className="absolute left-2.5 top-2.5 h-4 w-4 text-text-muted" />
                <Input
                  id="position"
                  placeholder="e.g. Frontend Dev"
                  className="pl-9"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  disabled={isUploading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-opening" className="text-sm font-medium">Job Opening ID</Label>
              <div className="relative">
                <Hash className="absolute left-2.5 top-2.5 h-4 w-4 text-text-muted" />
                <Input
                  id="job-opening"
                  placeholder="e.g. JOB-123"
                  className="pl-9"
                  value={jobOpening}
                  onChange={(e) => setJobOpening(e.target.value)}
                  disabled={isUploading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain" className="text-sm font-medium">Domain</Label>
              <div className="relative">
                <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-text-muted" />
                <Input
                  id="domain"
                  placeholder="e.g. Engineering"
                  className="pl-9"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  disabled={isUploading}
                />
              </div>
            </div>
          </div>

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

      {/* Progress & Status */}
      {isUploading && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between text-sm font-medium">
              <span>Processing...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-text-muted text-center">
              Processed {uploadedCount} of {totalCount} files
            </p>
          </CardContent>
        </Card>
      )}

      {/* Selected Files List (or Results Queue) */}
      {(files.length > 0 || (isUploading && filesQueue.length > 0)) && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-primary">
                {isUploading ? "Upload Queue" : `Selected Files (${files.length})`}
              </h3>
              {files.length > 50 && (
                <Badge variant="destructive">Max 50 files</Badge>
              )}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {/* Show Queue during upload, or Selected Files before upload */}
              {isUploading ? (
                filesQueue.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between p-3 rounded-lg border bg-background"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {file.status === "processing" && <Loader2 className="h-4 w-4 animate-spin text-accent" />}
                      {file.status === "success" && <CheckCircle2 className="h-4 w-4 text-success" />}
                      {file.status === "error" && <X className="h-4 w-4 text-danger" />}
                      {file.status === "pending" && <FileText className="h-4 w-4 text-text-muted" />}

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-primary truncate">
                          {file.name}
                        </p>
                        {file.message && (
                          <p className="text-xs text-danger truncate" title={file.message}>
                            {file.message}
                          </p>
                        )}
                        {file.candidateName && (
                          <p className="text-xs text-success">
                            Added: {file.candidateName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                files.map((file, index) => (
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
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Upload Button */}
            {!isUploading && files.length > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <Button
                  onClick={() => setFiles([])}
                  variant="outline"
                >
                  Clear All
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={files.length > 50}
                  className="bg-accent hover:bg-accent-hover"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload {files.length} Resume{files.length !== 1 ? 's' : ''}
                </Button>
              </div>
            )}

            {/* View Candidates Button (show when upload finishes and queue was cleared) */}
            {!isUploading && files.length === 0 && uploadedCount > 0 && (
              <div className="mt-6 flex justify-end">
                <Button onClick={() => router.push("/candidates")} className="bg-primary">
                  View Candidates
                </Button>
              </div>
            )}

          </CardContent>
        </Card>
      )}
    </div>
  );
}
