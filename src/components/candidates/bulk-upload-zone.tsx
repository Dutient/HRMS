"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X, Loader2, Briefcase, Hash, Globe } from "lucide-react";
import { useUpload } from "@/context/UploadContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FileWithPreview extends File {
  preview?: string;
}

export function BulkUploadZone() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { startUpload, isUploading } = useUpload();
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

    // Start the upload using context (continues in background)
    await startUpload(files, {
      position: position || undefined,
      job_opening: jobOpening || undefined,
      domain: domain || undefined,
    });

    // Show success message and navigate to candidates page
    toast({
      title: "Upload started!",
      description: `Processing ${files.length} resume${files.length !== 1 ? 's' : ''}. You can navigate to other pages while upload continues.`,
    });

    // Clear local file state
    setFiles([]);

    // Navigate to candidates page to see results
    setTimeout(() => {
      router.push("/candidates");
    }, 1500);
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
    </div>
  );
}
