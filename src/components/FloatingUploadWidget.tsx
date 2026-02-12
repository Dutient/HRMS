"use client";

import { useUpload } from "@/context/UploadContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  X, 
  ChevronDown, 
  ChevronUp,
  FileText
} from "lucide-react";
import { useState } from "react";

export function FloatingUploadWidget() {
  const { isUploading, progress, uploadedCount, totalCount, filesQueue, clearQueue } = useUpload();
  const [isExpanded, setIsExpanded] = useState(true);

  // Don't render if no upload is active and queue is empty
  if (!isUploading && filesQueue.length === 0) {
    return null;
  }

  const successCount = filesQueue.filter((f) => f.status === "success").length;
  const errorCount = filesQueue.filter((f) => f.status === "error").length;

  const handleClose = () => {
    if (!isUploading) {
      clearQueue();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
      <Card className="shadow-2xl border-accent/30 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-accent/5">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="shrink-0">
              {isUploading ? (
                <Loader2 className="h-5 w-5 text-accent animate-spin" />
              ) : successCount === totalCount ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <Upload className="h-5 w-5 text-accent" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-primary truncate">
                {isUploading
                  ? `Uploading ${uploadedCount} of ${totalCount} files...`
                  : `Upload Complete`}
              </h3>
              <p className="text-xs text-text-muted">
                {successCount} success {errorCount > 0 && `• ${errorCount} failed`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
            {!isUploading && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <div className="px-4 pt-3">
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-accent transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-text-muted text-right">
              {progress}%
            </div>
          </div>
        )}

        {/* Expanded File List */}
        {isExpanded && (
          <CardContent className="p-4 max-h-80 overflow-y-auto">
            <div className="space-y-2">
              {filesQueue.map((file, index) => (
                <div
                  key={index}
                  className={`
                    p-2 rounded-lg border text-sm transition-all
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
                  <div className="flex items-start gap-2">
                    <div className="shrink-0 mt-0.5">
                      {file.status === "processing" && (
                        <Loader2 className="h-4 w-4 text-accent animate-spin" />
                      )}
                      {file.status === "success" && (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      )}
                      {file.status === "error" && (
                        <XCircle className="h-4 w-4 text-danger" />
                      )}
                      {file.status === "pending" && (
                        <FileText className="h-4 w-4 text-text-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-primary truncate">
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
                    <Badge
                      variant="secondary"
                      className={`
                        shrink-0 text-xs h-5 px-2
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
                      {file.status === "processing" && "Processing"}
                      {file.status === "success" && "Done"}
                      {file.status === "error" && "Failed"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}

        {/* Footer Summary when Collapsed */}
        {!isExpanded && !isUploading && (
          <div className="px-4 pb-4">
            <div className="flex gap-2 justify-center">
              <Badge variant="secondary" className="bg-success/10 text-success">
                {successCount} Success
              </Badge>
              {errorCount > 0 && (
                <Badge variant="secondary" className="bg-danger/10 text-danger">
                  {errorCount} Failed
                </Badge>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
