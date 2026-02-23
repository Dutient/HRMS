"use client";

import * as React from "react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  Briefcase,
  Star,
  Linkedin,
  Upload,
  Globe,
  UserPlus,
  ExternalLink,
  FileText,
  Trash2,
  CalendarCheck,
  MapPin,
  Plane,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { deleteCandidate } from "@/app/actions/deleteCandidate";
import type { Candidate } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface CandidateCardProps {
  candidate: Candidate;
  isBestFit?: boolean;
}

const getMatchScoreBadge = (score: number | null, justification?: string | null, isBestFit?: boolean) => {
  if (score === null || score === undefined) return null;

  let colorClass = "bg-orange-50 text-orange-600 border-orange-200";
  if (score >= 90) colorClass = "bg-emerald-50 text-emerald-600 border-emerald-200";
  else if (score >= 70) colorClass = "bg-amber-50 text-amber-600 border-amber-200";
  else colorClass = "bg-gray-50 text-gray-500 border-gray-200";

  const glowClass = isBestFit ? "shadow-[0_0_8px_rgba(251,191,36,0.4)] border-amber-400/60" : "";

  const badge = (
    <Badge className={`${colorClass} ${glowClass} flex items-center gap-1 text-xs font-semibold px-2 py-0.5 border`}>
      <Star className={`h-2.5 w-2.5 fill-current`} />
      {score}% Match
      {justification && <Info className="h-2.5 w-2.5 ml-0.5 opacity-60" />}
    </Badge>
  );

  if (justification) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent side="top" sideOffset={6} className="z-[100] max-w-[260px] text-xs bg-gray-900 text-white border-0 p-3 shadow-2xl rounded-lg leading-relaxed">
            <p className="font-semibold mb-1">AI Analysis:</p>
            <p>{justification}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return badge;
};

const getSourceIcon = (source: string | null) => {
  if (!source) return <Globe className="h-3 w-3" />;
  const sourceMap: Record<string, typeof Linkedin> = {
    LinkedIn: Linkedin,
    "Bulk Upload": Upload,
    Referral: UserPlus,
    Indeed: Globe,
  };
  const IconComponent = sourceMap[source] || Globe;
  return <IconComponent className="h-3 w-3" />;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

export function CandidateCard({ candidate, isBestFit }: CandidateCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewProfile = () => {
    if (!candidate.resume_url) {
      toast({ title: "No resume available", description: "This candidate doesn't have a resume uploaded yet.", variant: "destructive" });
      return;
    }
    window.open(candidate.resume_url, "_blank", "noopener,noreferrer");
  };

  const handleScheduleInterview = () => {
    const subject = encodeURIComponent(`Interview Invitation - ${candidate.role} Position`);
    const body = encodeURIComponent(
      `Dear ${candidate.name},\n\nWe are pleased to invite you for an interview for the ${candidate.role} position.\n\nPlease let us know your availability.\n\nBest regards,\nHR Team`
    );
    window.location.href = `mailto:${candidate.email}?subject=${subject}&body=${body}`;
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setShowDeleteDialog(false);

      const result = await deleteCandidate(candidate.id);

      toast({
        title: result.success ? "Candidate Deleted" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });

      if (result.success) {
        router.refresh();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete candidate.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card
      className={`group relative z-0 hover:z-10 flex flex-col transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 ${isBestFit
        ? "border-amber-400 border-2 shadow-amber-100 shadow-md"
        : "border-border hover:border-accent/30"
        }`}
    >
      {/* Best Fit ribbon */}
      {isBestFit && (
        <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-br-xl flex items-center gap-1 z-10 shadow">
          <Star className="h-2.5 w-2.5 fill-current" />
          BEST FIT
        </div>
      )}

      <CardContent className="flex flex-col flex-1 p-4 pt-5 gap-3">

        {/* ── Header: Avatar + Name + Match Badge ── */}
        <div className="flex items-start gap-3 pt-1">
          <Avatar className={`h-12 w-12 shrink-0 border-2 ${isBestFit ? "border-amber-400" : "border-accent/20"}`}>
            <AvatarImage src={candidate.avatar_url || ""} />
            <AvatarFallback className={`text-sm font-bold ${isBestFit ? "bg-amber-100 text-amber-700" : "bg-accent text-white"}`}>
              {getInitials(candidate.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0">
                <h3 className="font-semibold text-sm text-primary leading-tight truncate">
                  {candidate.name}
                </h3>
                <p className="text-xs text-text-muted truncate mt-0.5">{candidate.role}</p>
              </div>
              <div className="shrink-0">
                {getMatchScoreBadge(candidate.match_score, (candidate as any).ai_justification, isBestFit)}
              </div>
            </div>

            {candidate.source && (
              <div className="flex items-center gap-1 mt-1.5 text-[11px] text-text-muted/70">
                {getSourceIcon(candidate.source)}
                <span>via {candidate.source}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Info rows ── */}
        <div className="space-y-1 text-xs text-text-muted bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 shrink-0 text-gray-500" />
            <span className="truncate">{candidate.email}</span>
          </div>
          {candidate.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0 text-accent/70" />
              <span>{candidate.phone}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            {candidate.experience !== null && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5 shrink-0 text-accent/70" />
                <span>{candidate.experience} yr{candidate.experience !== 1 ? "s" : ""} exp</span>
              </div>
            )}
            {candidate.applied_date && (
              <span className="text-[10px] text-text-muted/60 ml-auto">
                {formatDate(candidate.applied_date)}
              </span>
            )}
          </div>
          {/* Location & Relocation */}
          {(candidate.location || candidate.will_relocate) && (
            <div className="flex items-center gap-2">
              {candidate.location && (
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-accent/70" />
                  <span className="truncate">{candidate.location}</span>
                </div>
              )}
              {candidate.will_relocate && (
                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px] px-1.5 py-0 h-4 shrink-0 gap-0.5">
                  <Plane className="h-2.5 w-2.5" />
                  Relocate
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* ── Skills ── */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {candidate.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-md bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
            {candidate.skills.length > 4 && (
              <span className="inline-flex items-center rounded-md bg-gray-100 text-gray-500 px-2 py-0.5 text-[11px] font-medium">
                +{candidate.skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* ── Spacer to push footer down ── */}
        <div className="flex-1" />

        {/* ── Footer Actions ── */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs gap-1.5"
            onClick={handleViewProfile}
            disabled={!candidate.resume_url}
          >
            <FileText className="h-3.5 w-3.5" />
            Resume
            {candidate.resume_url && <ExternalLink className="h-3 w-3 opacity-50" />}
          </Button>

          <Button
            size="sm"
            className="flex-1 h-8 text-xs gap-1.5 bg-accent hover:bg-accent-hover"
            onClick={handleScheduleInterview}
          >
            <CalendarCheck className="h-3.5 w-3.5" />
            Interview
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className={`h-8 w-8 p-0 shrink-0 transition-colors ${isDeleting ? "text-accent" : "text-gray-300 hover:text-red-500 hover:bg-red-50"
                    }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {isDeleting ? "Deleting..." : "Delete candidate"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* ── Delete Confirmation Dialog ── */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-[400px] border-none bg-white p-0 overflow-hidden rounded-2xl shadow-2xl">
            <div className="bg-red-50 p-6 flex flex-col items-center text-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <DialogHeader className="p-0 text-center items-center">
                <DialogTitle className="text-xl font-bold text-gray-900">Delete Candidate?</DialogTitle>
                <DialogDescription className="text-gray-600 max-w-[280px]">
                  This will permanently remove <span className="font-semibold text-gray-900">{candidate.name}</span> and their resume. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
            </div>
            <DialogFooter className="p-4 bg-gray-50 flex flex-row items-center gap-3 sm:justify-center">
              <Button
                variant="ghost"
                className="flex-1 font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-11"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 font-semibold bg-red-600 hover:bg-red-700 h-11 shadow-md shadow-red-100"
                onClick={handleDelete}
              >
                Delete Candidate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </CardContent>
    </Card >
  );
}
