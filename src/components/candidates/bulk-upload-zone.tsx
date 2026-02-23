"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X, Loader2, Briefcase, Hash, Globe, CheckCircle2, HardDrive, FileSpreadsheet } from "lucide-react";
import { useUpload } from "@/context/UploadContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { openGooglePicker } from "@/lib/google-picker";
import { processDriveFile } from "@/app/actions/process-drive-file";
import { parseSpreadsheet, processSingleRow } from "@/app/actions/process-spreadsheet";

interface FileWithPreview extends File {
  preview?: string;
}

export function BulkUploadZone() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isDriveImporting, setIsDriveImporting] = useState(false);
  const [isSpreadsheetProcessing, setIsSpreadsheetProcessing] = useState(false);
  const {
    startUpload,
    isUploading,
    progress,
    uploadedCount,
    totalCount,
    filesQueue,
    cancelUpload,
    setIsUploading,
    setProgress,
    setUploadedCount,
    setTotalCount,
    setFilesQueue
  } = useUpload();
  const { toast } = useToast();
  const router = useRouter();

  // Metadata state
  const [position, setPosition] = useState("");
  const [jobOpening, setJobOpening] = useState("");
  const [domain, setDomain] = useState("");

  // ── Google Drive Import ──────────────────────────────────────────────────
  const handleDriveImport = useCallback(async () => {
    try {
      const result = await openGooglePicker();
      if (!result) return;

      setIsDriveImporting(true);
      setIsUploading(true);
      setTotalCount(result.files.length);
      setUploadedCount(0);
      setProgress(0);
      setFilesQueue(result.files.map(f => ({ name: f.name, status: "pending" })));

      toast({
        title: `Processing ${result.files.length} file(s) from Drive`,
        description: "Downloading and extracting resume data...",
      });

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < result.files.length; i++) {
        const file = result.files[i];

        setFilesQueue(prev => prev.map((f, idx) => idx === i ? { ...f, status: "processing" } : f));

        const res = await processDriveFile(file, result.accessToken, {
          position: position || undefined,
          job_opening: jobOpening || undefined,
          domain: domain || undefined,
        });

        if (res.success) {
          successCount++;
          setFilesQueue(prev => prev.map((f, idx) => idx === i ? { ...f, status: "success", candidateName: res.candidateName } : f));
        } else {
          errorCount++;
          setFilesQueue(prev => prev.map((f, idx) => idx === i ? { ...f, status: "error", message: res.message } : f));
          console.error(`Drive import failed for ${file.name}:`, res.message);
        }

        const completed = i + 1;
        setUploadedCount(completed);
        setProgress(Math.round((completed / result.files.length) * 100));
      }

      toast({
        title: successCount > 0 ? "Drive Import Complete" : "Drive Import Failed",
        description: `${successCount} succeeded, ${errorCount} failed.`,
        variant: errorCount > 0 ? "destructive" : "default",
      });

      if (successCount > 0) {
        router.refresh();
      }
    } catch (err) {
      console.error("[BulkUploadZone] Google Drive import error:", err);

      let errorTitle = "Drive Picker Error";
      let errorDescription = err instanceof Error ? err.message : "Could not open Google Drive Picker.";

      // Specific handling for common Google API errors to help the user
      if (errorDescription.includes("origin")) {
        errorTitle = "Security Error (Origin Mismatch)";
        errorDescription = "This domain is not authorized in your Google Cloud Console. Please add your production URL to 'Authorized JavaScript origins'.";
      } else if (errorDescription.includes("idpiframe_initialization_failed")) {
        errorTitle = "Browser Blocked Initialization";
        errorDescription = "Initialization failed. This usually happens due to third-party cookies being blocked or an unauthorized origin.";
      } else if (errorDescription.includes("popup_closed_by_user")) {
        errorTitle = "Login Cancelled";
        errorDescription = "The Google login popup was closed before completion.";
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setIsDriveImporting(false);
      setIsUploading(false);
    }
  }, [position, jobOpening, domain, toast, router, setIsUploading, setProgress, setUploadedCount, setTotalCount, setFilesQueue]);

  // ── Spreadsheet (CSV/XLSX) Import ──────────────────────────────────────
  const handleSpreadsheetUpload = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.xlsx,.xls";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsSpreadsheetProcessing(true);
      toast({
        title: `Reading ${file.name}...`,
        description: "Parsing spreadsheet data.",
      });

      try {
        const formData = new FormData();
        formData.append("file", file);

        const parseResult = await parseSpreadsheet(formData);

        if (!parseResult.success) {
          throw new Error(parseResult.message || "Failed to parse spreadsheet");
        }

        const rows = parseResult.rows;
        const total = rows.length;

        setIsUploading(true);
        setTotalCount(total);
        setUploadedCount(0);
        setProgress(0);
        setFilesQueue(rows.map(row => ({ name: row.name || row.email || "Candidate", status: "pending" })));

        toast({
          title: `Found ${total} candidates`,
          description: "Starting import in batches of 50...",
        });

        let success = 0;
        let failed = 0;
        const SPREADSHEET_BATCH_SIZE = 50;

        for (let i = 0; i < total; i += SPREADSHEET_BATCH_SIZE) {
          const batch = rows.slice(i, i + SPREADSHEET_BATCH_SIZE);
          const batchIndices = batch.map((_, idx) => i + idx);

          setFilesQueue(prev => prev.map((f, idx) => batchIndices.includes(idx) ? { ...f, status: "processing" } : f));

          const batchPromises = batch.map(async (row, localIdx) => {
            const globalIdx = i + localIdx;
            try {
              const res = await processSingleRow(row, {
                position: position || undefined,
                job_opening: jobOpening || undefined,
                domain: domain || undefined,
              });
              return { globalIdx, res };
            } catch (err) {
              return { globalIdx, res: { success: false, message: err instanceof Error ? err.message : "Unknown error" } };
            }
          });

          const results = await Promise.all(batchPromises);

          for (const { globalIdx, res } of results) {
            if (res.success) {
              success++;
              setFilesQueue(prev => {
                const updated = [...prev];
                updated[globalIdx] = { ...updated[globalIdx], status: "success", candidateName: res.candidateName };
                return updated;
              });
            } else {
              failed++;
              setFilesQueue(prev => {
                const updated = [...prev];
                updated[globalIdx] = { ...updated[globalIdx], status: "error", message: res.message };
                return updated;
              });
            }
          }

          const completed = Math.min(i + SPREADSHEET_BATCH_SIZE, total);
          setUploadedCount(completed);
          setProgress(Math.round((completed / total) * 100));

          // If any row in the batch had a resume URL, it likely used Bedrock.
          // Add a small delay to prevent rapid-fire 429s if many have URLs.
          const hasResumeUrls = batch.some(r => r.resumeUrl);
          if (hasResumeUrls && completed < total) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        toast({
          title: `Import Complete`,
          description: `${success} imported successfully. ${failed} failed.`,
          variant: failed > 0 ? "destructive" : "default",
        });

        if (success > 0) {
          router.refresh();
        }

      } catch (err) {
        toast({
          title: "Import Failed",
          description: err instanceof Error ? err.message : "Unknown error",
          variant: "destructive",
        });
      } finally {
        setIsSpreadsheetProcessing(false);
        setIsUploading(false);
      }
    };
    input.click();
  }, [position, jobOpening, domain, toast, router, setIsUploading, setProgress, setUploadedCount, setTotalCount, setFilesQueue]);

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
              PDF resumes (max 50) • CSV/Excel spreadsheets with candidate data
            </p>

            {!isUploading && (
              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-4 flex-wrap justify-center">
                  <Button
                    onClick={() => document.getElementById("file-upload")?.click()}
                    variant="outline"
                    className="h-12 px-6"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Drop PDFs
                  </Button>

                  <div className="relative group">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none text-[10px] px-2 py-0 h-5 shadow-sm">
                        RECOMMENDED FOR AI RANKING
                      </Badge>
                    </div>
                    <Button
                      onClick={handleDriveImport}
                      disabled={isDriveImporting}
                      className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200/50"
                    >
                      {isDriveImporting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <HardDrive className="mr-2 h-4 w-4" />
                      )}
                      Import from Google Drive
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleSpreadsheetUpload}
                    disabled={isSpreadsheetProcessing}
                    className="h-12 px-6 border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                  >
                    {isSpreadsheetProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                    )}
                    Upload Spreadsheet
                  </Button>
                </div>

                <p className="text-xs text-text-muted max-w-md mx-auto italic">
                  Tip: Use the <strong>Google Drive</strong> button to pick PDF resumes. Selection via Drive ensures the AI can read full resumes for accurate ranking.
                </p>
              </div>
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
              <div className="flex items-center gap-4">
                <span>{Math.round(progress)}%</span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={cancelUpload}
                  className="h-7 px-3 text-xs"
                >
                  Stop Upload
                </Button>
              </div>
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
