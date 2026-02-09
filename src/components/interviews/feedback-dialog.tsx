"use client";

import { useState } from "react";
import { Star, Loader2, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitInterviewFeedback } from "@/app/actions/get-interviews";

interface FeedbackDialogProps {
  interviewId: string;
  candidateName: string;
  interviewType: string;
  trigger?: React.ReactNode;
}

const decisions = [
  { value: "Strong Yes", icon: ThumbsUp, color: "text-success bg-success/10 border-success" },
  { value: "Yes", icon: ThumbsUp, color: "text-info bg-info/10 border-info" },
  { value: "No", icon: ThumbsDown, color: "text-danger bg-danger/10 border-danger" },
] as const;

export function FeedbackDialog({ interviewId, candidateName, interviewType, trigger }: FeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [decision, setDecision] = useState<"Strong Yes" | "Yes" | "No" | null>(null);
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!decision) {
      setError("Please select a decision");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitInterviewFeedback({
        interviewId,
        feedbackScore: rating,
        feedbackNotes: notes,
        decision,
      });

      if (result.success) {
        // Reset form and close dialog
        setRating(0);
        setDecision(null);
        setNotes("");
        setOpen(false);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to submit feedback. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <MessageSquare className="mr-2 h-4 w-4" />
            Add Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Interview Feedback</DialogTitle>
          <DialogDescription>
            Provide feedback for <span className="font-semibold text-primary">{candidateName}</span>'s {interviewType} interview
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-3">
            <Label>
              Overall Rating <span className="text-danger">*</span>
            </Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none focus:ring-2 focus:ring-accent rounded-full p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      (hoveredRating >= star || rating >= star)
                        ? "fill-warning text-warning"
                        : "text-gray-300"
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-semibold text-text-muted">
                  {rating} / 5
                </span>
              )}
            </div>
          </div>

          {/* Decision */}
          <div className="space-y-3">
            <Label>
              Hiring Decision <span className="text-danger">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {decisions.map(({ value, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDecision(value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    decision === value
                      ? color
                      : "border-border hover:border-accent/50"
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{value}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="feedback-notes">
              Feedback Notes
            </Label>
            <Textarea
              id="feedback-notes"
              placeholder="Share your detailed observations, strengths, areas of improvement..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-text-muted">
              Be specific about technical skills, communication, problem-solving approach, etc.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-danger/10 border border-danger/20 p-3 text-sm text-danger">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent-hover">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
