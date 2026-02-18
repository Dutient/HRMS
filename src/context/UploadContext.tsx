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

    // Process files sequentially
    for (let i = 0; i < files.length; i++) {
      // Check if upload was aborted (optional future feature, but good practice)
      if (uploadAbortRef.current) break;

      const file = files[i];

      // Update status to processing
      setFilesQueue(prev => prev.map((item, index) =>
        index === i ? { ...item, status: "processing" } : item
      ));

      try {
        const formData = new FormData();
        formData.append("file", file);

        // Call server action for single file
        const result = await uploadResumesAndCreateCandidates(formData, metadata);

        // Update status based on result
        setFilesQueue(prev => prev.map((item, index) =>
          index === i ? {
            ...item,
            status: result.success ? "success" : "error",
            message: result.message,
            candidateName: result.candidateName
          } : item
        ));

      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        setFilesQueue(prev => prev.map((item, index) =>
          index === i ? {
            ...item,
            status: "error",
            message: error instanceof Error ? error.message : "Unexpected error"
          } : item
        ));
      }

      // Update progress
      const currentCount = i + 1;
      setUploadedCount(currentCount);
      setProgress(Math.round((currentCount / files.length) * 100));

      // Rate limiting delay (3 seconds) - only if not the last file
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setIsUploading(false);
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
