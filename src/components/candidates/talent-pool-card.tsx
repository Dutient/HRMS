"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
} from "lucide-react";

interface TalentPoolCandidate {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  skills: string[];
  availability: string;
  lastEngaged: string;
  rating: number;
  avatar?: string;
}

interface TalentPoolCardProps {
  candidate: TalentPoolCandidate;
  onDeploy?: (id: number) => void;
  onViewDetails?: (id: number) => void;
}

export function TalentPoolCard({
  candidate,
  onDeploy,
  onViewDetails,
}: TalentPoolCardProps) {
  return (
    <Card className="border-success/20 bg-gradient-to-br from-success/5 to-transparent transition-all hover:shadow-lg hover:border-success/40">
      <CardContent className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3 md:gap-4">
          <Avatar className="h-14 w-14 md:h-16 md:w-16 border-2 border-success">
            <AvatarImage src={candidate.avatar} />
            <AvatarFallback className="bg-success text-white font-semibold text-lg">
              {candidate.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading text-lg md:text-xl font-semibold text-primary truncate">
                    {candidate.name}
                  </h3>
                  <Badge className="bg-success text-white whitespace-nowrap">
                    Ready to Deploy
                  </Badge>
                </div>
                <p className="text-sm md:text-base text-text-muted truncate">
                  {candidate.role}
                </p>
              </div>
              <div className="flex items-center gap-1 text-warning">
                <Star className="h-4 w-4 fill-warning" />
                <span className="font-semibold text-base">{candidate.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-text-muted">
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{candidate.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{candidate.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{candidate.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 flex-shrink-0" />
            <span>{candidate.experience}</span>
          </div>
        </div>

        {/* Availability Badge */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-success" />
          <span className="text-sm font-medium text-success">
            {candidate.availability}
          </span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {candidate.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-border">
          <p className="text-xs text-text-muted">
            Last engaged: {candidate.lastEngaged}
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => onViewDetails?.(candidate.id)}
            >
              View Details
            </Button>
            <Button
              size="sm"
              className="flex-1 sm:flex-none bg-success hover:bg-success/90 text-white"
              onClick={() => onDeploy?.(candidate.id)}
            >
              Deploy Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
