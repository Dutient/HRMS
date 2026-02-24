"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useRef } from "react";
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
  setIsUploading: (val: boolean) => void;
  setProgress: (val: number) => void;
  setUploadedCount: (val: number) => void;
  setTotalCount: (val: number) => void;
  setFilesQueue: React.Dispatch<React.SetStateAction<FileStatus[]>>;
  startUpload: (files: File[], metadata?: { position?: string; job_opening?: string; domain?: string }) => Promise<void>;
  clearQueue: () => void;
  cancelUpload: () => void;
  uploadAbortRef: React.MutableRefObject<boolean>;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 2000;

export function UploadProvider({ children }: { children: ReactNode }) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [filesQueue, setFilesQueue] = useState<FileStatus[]>([]);
  const uploadAbortRef = useRef(false);

  const startUpload = useCallback(async (
    files: File[],
    metadata?: { position?: string; job_opening?: string; domain?: string }
  ) => {
    if (files.length > 50) {
      alert("Maximum 50 files allowed per upload");
      return;
    }

    // Initialize queue — all files start as pending
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

    let completedCount = 0;

    // Split files into micro-batches of BATCH_SIZE
    for (let batchStart = 0; batchStart < files.length; batchStart += BATCH_SIZE) {
      if (uploadAbortRef.current) break;

      const batchFiles = files.slice(batchStart, batchStart + BATCH_SIZE);
      const batchIndices = batchFiles.map((_, i) => batchStart + i);

      // Mark all files in this batch as "processing"
      setFilesQueue((prev) =>
        prev.map((item, index) =>
          batchIndices.includes(index) ? { ...item, status: "processing" } : item
        )
      );

      // Fire all files in the batch simultaneously
      const batchResults = await Promise.allSettled(
        batchFiles.map(async (file, localIdx) => {
          const globalIdx = batchStart + localIdx;
          const formData = new FormData();
          formData.append("file", file);
          const result = await uploadResumesAndCreateCandidates(formData, metadata);
          return { globalIdx, result };
        })
      );

      // Update each file's status based on its settled result
      setFilesQueue((prev) => {
        const updated = [...prev];
        for (const settled of batchResults) {
          if (settled.status === "fulfilled") {
            const { globalIdx, result } = settled.value;
            updated[globalIdx] = {
              ...updated[globalIdx],
              status: result.success ? "success" : "error",
              message: result.message,
              candidateName: result.candidateName,
            };
          } else {
            // Promise itself rejected (network error, etc.)
            const localIdx = batchResults.indexOf(settled);
            const globalIdx = batchStart + localIdx;
            updated[globalIdx] = {
              ...updated[globalIdx],
              status: "error",
              message: settled.reason instanceof Error ? settled.reason.message : "Unexpected error",
            };
          }
        }
        return updated;
      });

      // Update progress counters
      completedCount += batchFiles.length;
      setUploadedCount(completedCount);
      setProgress(Math.round((completedCount / files.length) * 100));

      // Wait between batches to respect Bedrock rate limits (skip delay after last batch)
      const isLastBatch = batchStart + BATCH_SIZE >= files.length;
      if (!isLastBatch && !uploadAbortRef.current) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
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

  const cancelUpload = useCallback(() => {
    uploadAbortRef.current = true;
    setIsUploading(false);
    setFilesQueue((prev) =>
      prev.map((item) =>
        item.status === "pending" || item.status === "processing"
          ? { ...item, status: "error", message: "Upload cancelled by user" }
          : item
      )
    );
  }, []);

  return (
    <UploadContext.Provider
      value={{
        isUploading,
        setIsUploading,
        progress,
        setProgress,
        uploadedCount,
        setUploadedCount,
        totalCount,
        setTotalCount,
        filesQueue,
        setFilesQueue,
        startUpload,
        clearQueue,
        cancelUpload,
        uploadAbortRef,
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
