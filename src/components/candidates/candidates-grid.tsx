"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { CandidateCard } from "@/components/candidates/candidate-card";
import type { Candidate } from "@/lib/supabase";

interface CandidatesGridProps {
  candidates: Candidate[];
}

export function CandidatesGrid({ candidates }: CandidatesGridProps) {
  if (candidates.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <Users className="mx-auto h-16 w-16 text-text-muted mb-4" />
          <h3 className="font-heading text-xl font-semibold text-primary mb-2">
            No candidates yet
          </h3>
          <p className="text-text-muted mb-4">
            Start by uploading resumes or adding candidates manually
          </p>
          <Button className="bg-accent hover:bg-accent-hover">
            Add First Candidate
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {candidates.map((candidate) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
        />
      ))}
    </div>
  );
}
