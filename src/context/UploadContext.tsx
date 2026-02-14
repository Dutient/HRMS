"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from "react";
import { uploadResumesAndCreateCandidates } from "@/app/actions/bulk-upload-resumes";

interface FileStatus {
  name: string;
  status: "pending" | "processing" | "success" | "error";
  message?: string;
  candidateName?: string;
}

interface UploadContextType {
  isUploading: boolean;
  progress: number;
  uploadedCount: number;
  totalCount: number;
  filesQueue: FileStatus[];
  startUpload: (files: File[], metadata?: { position?: string; job_opening?: string; domain?: string }) => Promise<void>;
  clearQueue: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [filesQueue, setFilesQueue] = useState<FileStatus[]>([]);
  const uploadAbortRef = useRef(false);

  // Reset abort flag when upload starts
  useEffect(() => {
    if (isUploading) {
      uploadAbortRef.current = false;
    }
  }, [isUploading]);

  const startUpload = useCallback(async (files: File[], metadata?: { position?: string; job_opening?: string; domain?: string }) => {
    // Validate file count
    if (files.length > 50) {
      alert("Maximum 50 files allowed per upload");
      return;
    }

    // Initialize upload state
    const initialQueue: FileStatus[] = files.map((file) => ({
      name: file.name,
      status: "pending",
    }));

    setFilesQueue(initialQueue);
    setIsUploading(true);
    setTotalCount(files.length);
    setUploadedCount(0);
    setProgress(0);
    uploadAbortRef.current = false;

    // Process all files at once using bulk upload
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      // Call bulk upload action
      const results = await uploadResumesAndCreateCandidates(formData, metadata);

      // Update queue with results
      const updatedQueue = results.map((result) => ({
        name: result.fileName,
        status: result.success ? ("success" as const) : ("error" as const),
        message: result.message,
        candidateName: result.candidateName,
      }));

      setFilesQueue(updatedQueue);
      setUploadedCount(results.length);
      setProgress(100);

    } catch (error) {
      // Handle unexpected errors
      console.error("Upload error:", error);
      const errorQueue = files.map((file) => ({
        name: file.name,
        status: "error" as const,
        message: error instanceof Error ? error.message : "Unexpected error occurred",
      }));
      setFilesQueue(errorQueue);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const clearQueue = useCallback(() => {
    setFilesQueue([]);
    setProgress(0);
    setUploadedCount(0);
    setTotalCount(0);
    setIsUploading(false);
  }, []);

  return (
    <UploadContext.Provider
      value={{
        isUploading,
        progress,
        uploadedCount,
        totalCount,
        filesQueue,
        startUpload,
        clearQueue,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error("useUpload must be used within an UploadProvider");
  }
  return context;
}
