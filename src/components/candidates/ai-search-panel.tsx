"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { parseJobDescription } from "@/app/actions/parse-jd";
import { getCandidatesForRanking } from "@/app/actions/get-candidates";
import { rankSingleCandidate } from "@/app/actions/rank-candidates";

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

  const [progress, setProgress] = useState<{
    total: number;
    processed: number;
    percentage: number;
    currentName?: string;
  } | null>(null);

  const abortRef = useRef(false);

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
    abortRef.current = false;

    try {
      // 1. Fetch candidates to rank
      const candidates = await getCandidatesForRanking(filters);

      if (candidates.length === 0) {
        setIsRanking(false);
        setResult({
          type: "error",
          message: "No candidates found matching the current filters.",
        });
        return;
      }

      setProgress({
        total: candidates.length,
        processed: 0,
        percentage: 0,
        currentName: "Starting...",
      });

      let successCount = 0;
      let errorCount = 0;

      // 2. Loop through candidates
      for (let i = 0; i < candidates.length; i++) {
        if (abortRef.current) break;

        const candidate = candidates[i];

        // Update progress
        setProgress({
          total: candidates.length,
          processed: i + 1,
          percentage: Math.round(((i) / candidates.length) * 100), // Show progress start of item
          currentName: `Ranking ${candidate.name}...`,
        });

        try {
          // Call Server Action
          const response = await rankSingleCandidate(candidate.id, jdText);

          if (response.success) {
            successCount++;
          } else {
            console.error(`Failed to rank ${candidate.name}:`, response.message);
            errorCount++;
          }
        } catch (err) {
          console.error(`Unexpected error ranking ${candidate.name}:`, err);
          errorCount++;
        }

        // Update percentage after completion
        setProgress(prev => prev ? {
          ...prev,
          processed: i + 1,
          percentage: Math.round(((i + 1) / candidates.length) * 100)
        } : null);

        // Rate Limiting Delay (4 seconds)
        if (i < candidates.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 6500));
        }
      }

      setIsRanking(false);
      setProgress(null);
      setResult({
        type: "success",
        message: `Ranking complete! ${successCount} ranked successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}.`,
      });
      onRankingComplete?.();

    } catch (error) {
      console.error("Fatal error in ranking loop:", error);
      setIsRanking(false);
      setResult({
        type: "error",
        message: "Failed to start ranking process. Please try again.",
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
                  {progress?.currentName || "Ranking Candidates..."}
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
                <span className="text-text-muted">
                  {progress.currentName || "Processing..."}
                </span>
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
              requirements, assigning match scores from 0-100. Processing happens sequentially
              to ensure high quality results. Candidates will be automatically sorted by relevance.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
