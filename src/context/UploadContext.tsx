"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { processResume } from "@/app/actions/process-resume";

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
  startUpload: (files: File[]) => Promise<void>;
  clearQueue: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [filesQueue, setFilesQueue] = useState<FileStatus[]>([]);

  const startUpload = useCallback(async (files: File[]) => {
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

    // Process files sequentially
    for (let i = 0; i < files.length; i++) {
      // Update current file status to processing
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

        // Update file status based on result
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

        // Update progress
        const completed = i + 1;
        setUploadedCount(completed);
        setProgress(Math.round((completed / files.length) * 100));

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
                  message: error instanceof Error ? error.message : "Unexpected error occurred",
                }
              : file
          )
        );

        // Still update progress even on error
        const completed = i + 1;
        setUploadedCount(completed);
        setProgress(Math.round((completed / files.length) * 100));
      }
    }

    // Upload complete
    setIsUploading(false);
    setProgress(100);
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
