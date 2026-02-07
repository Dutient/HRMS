"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Mail, Phone } from "lucide-react";

interface Candidate {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  skills: string[];
  status: string;
  source: string;
  appliedDate: string;
  matchScore: number;
  avatar?: string;
}

interface CandidateTableProps {
  candidates: Candidate[];
  onViewProfile?: (id: number) => void;
  onScheduleInterview?: (id: number) => void;
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    New: "bg-info/10 text-info border-info/20",
    Screening: "bg-warning/10 text-warning border-warning/20",
    Interview: "bg-accent/10 text-accent border-accent/20",
    "Final Round": "bg-success/10 text-success border-success/20",
    Selected: "bg-success text-white border-success",
    Rejected: "bg-danger/10 text-danger border-danger/20",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

export function CandidateTable({
  candidates,
  onViewProfile,
  onScheduleInterview,
}: CandidateTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[300px]">Candidate</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Match Score</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate) => (
              <TableRow key={candidate.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={candidate.avatar} />
                      <AvatarFallback className="bg-accent text-white font-semibold text-sm">
                        {candidate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-primary">
                        {candidate.name}
                      </p>
                      <p className="text-sm text-text-muted">
                        {candidate.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-text">{candidate.role}</p>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(candidate.status)}>
                    {candidate.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-semibold text-accent">
                      {candidate.matchScore}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-text-muted">{candidate.experience}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{candidate.source}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewProfile?.(candidate.id)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      className="bg-accent hover:bg-accent-hover"
                      onClick={() => onScheduleInterview?.(candidate.id)}
                    >
                      Interview
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-border">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={candidate.avatar} />
                <AvatarFallback className="bg-accent text-white font-semibold">
                  {candidate.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-primary truncate">
                      {candidate.name}
                    </h3>
                    <p className="text-sm text-text-muted truncate">
                      {candidate.role}
                    </p>
                  </div>
                  <Badge className={getStatusColor(candidate.status)}>
                    {candidate.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col gap-1 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{candidate.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" />
                <span>{candidate.phone}</span>
              </div>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{candidate.skills.length - 3}
                </Badge>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                <span className="font-semibold text-accent">
                  {candidate.matchScore}%
                </span>
                <span className="text-text-muted ml-2">
                  {candidate.experience}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewProfile?.(candidate.id)}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  className="bg-accent hover:bg-accent-hover"
                  onClick={() => onScheduleInterview?.(candidate.id)}
                >
                  Interview
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
