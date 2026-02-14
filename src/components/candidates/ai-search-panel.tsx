"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createRankingJob, getRankingJobStatus } from "@/app/actions/ranking-jobs";
import { parseJobDescription } from "@/app/actions/parse-jd";

interface AISearchPanelProps {
  onRankingComplete?: () => void;
  filters?: {
    position?: string;
    job_opening?: string;
    domain?: string;
  };
}

export function AISearchPanel({ onRankingComplete, filters }: AISearchPanelProps = {}) {
  const [jdText, setJdText] = useState("");
  const [isRanking, setIsRanking] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    total: number;
    processed: number;
    percentage: number;
  } | null>(null);

  // Poll for job status
  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const response = await getRankingJobStatus(jobId);

      if (!response.success || !response.job) {
        setIsRanking(false);
        setResult({
          type: "error",
          message: response.message || "Failed to get job status",
        });
        return;
      }

      const { status, total_candidates, processed_candidates, error_message } = response.job;

      // Update progress
      if (total_candidates > 0) {
        setProgress({
          total: total_candidates,
          processed: processed_candidates,
          percentage: Math.round((processed_candidates / total_candidates) * 100),
        });
      }

      if (status === "completed") {
        setIsRanking(false);
        setCurrentJobId(null);
        setProgress(null);
        setResult({
          type: "success",
          message: `Successfully ranked ${total_candidates} candidates!`,
        });
        onRankingComplete?.();
      } else if (status === "failed") {
        setIsRanking(false);
        setCurrentJobId(null);
        setProgress(null);
        setResult({
          type: "error",
          message: error_message || "Ranking failed. Please try again.",
        });
      }
      // If processing or queued, continue polling
    } catch (error) {
      console.error("Error polling job status:", error);
    }
  }, [onRankingComplete]);

  // Effect to poll job status
  useEffect(() => {
    if (!currentJobId) return;

    const interval = setInterval(() => {
      pollJobStatus(currentJobId);
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [currentJobId, pollJobStatus]);

  const handleRank = async () => {
    if (!jdText.trim()) {
      setResult({
        type: "error",
        message: "Please enter a job description",
      });
      return;
    }

    setIsRanking(true);
    setResult(null);
    setProgress(null);

    try {
      const response = await createRankingJob(jdText, filters);

      if (response.success && response.jobId) {
        setCurrentJobId(response.jobId);
        setResult({
          type: "success",
          message: "Ranking job started. This may take a few minutes for large batches...",
        });
        // Start polling
        pollJobStatus(response.jobId);
      } else {
        setIsRanking(false);
        setResult({
          type: "error",
          message: response.message,
        });
      }
    } catch {
      setIsRanking(false);
      setResult({
        type: "error",
        message: "Failed to start ranking job. Please try again.",
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRanking(true);
    setResult(null);

    try {
      const parseResult = await parseJobDescription(file);

      if (parseResult.success && parseResult.text) {
        setJdText(parseResult.text);
        setResult({
          type: "success",
          message: `Job description extracted from ${file.name}`,
        });
      } else {
        setResult({
          type: "error",
          message: parseResult.message || "Failed to extract text from file",
        });
      }
    } catch {
      setResult({
        type: "error",
        message: "Failed to process file. Please try again.",
      });
    } finally {
      setIsRanking(false);
      // Reset input
      e.target.value = "";
    }
  };

  return (
    <Card className="border-accent/20 bg-linear-to-r from-accent/5 to-transparent">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-accent" />
          <h3 className="font-heading text-lg font-semibold text-primary">
            AI Smart Search & Ranking
          </h3>
          <Badge variant="secondary" className="ml-auto bg-accent/10 text-accent">
            Powered by Gemini
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="jd-text" className="text-sm font-medium text-primary mb-2 block">
              Job Description
            </label>
            <Textarea
              id="jd-text"
              placeholder="Paste job description here or upload a file below..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              disabled={isRanking}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-text-muted mt-1">
              Minimum 50 characters required for accurate ranking
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleRank}
              disabled={isRanking || !jdText.trim() || jdText.trim().length < 50}
              className="bg-accent hover:bg-accent-hover flex-1"
            >
              {isRanking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ranking Candidates...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Rank All Candidates
                </>
              )}
            </Button>

            <div>
              <input
                type="file"
                id="jd-upload"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                disabled={isRanking}
                className="hidden"
              />
              <Button
                asChild
                variant="outline"
                disabled={isRanking}
                className="border-accent text-accent hover:bg-accent/10"
              >
                <label htmlFor="jd-upload" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload JD File
                </label>
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          {progress && isRanking && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Processing candidates...</span>
                <span className="font-medium text-primary">
                  {progress.processed} / {progress.total} ({progress.percentage}%)
                </span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
            </div>
          )}

          {result && (
            <div
              className={`
                p-3 rounded-lg border flex items-start gap-2
                ${result.type === "success"
                  ? "bg-success/5 border-success/20"
                  : "bg-danger/5 border-danger/20"
                }
              `}
            >
              {result.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm ${result.type === "success" ? "text-success" : "text-danger"
                  }`}
              >
                {result.message}
              </p>
            </div>
          )}

          <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
            <p className="text-xs text-text-muted">
              <span className="font-semibold text-accent">💡 How it works:</span> AI
              analyzes each candidate&apos;s skills, experience, and summary against your job
              requirements, assigning match scores from 0-100. Processing happens in the background
              and can handle large batches (50+ resumes) without timeouts. Candidates will be
              automatically sorted by relevance once complete.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
