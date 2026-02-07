"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Upload,
  FileText,
  Sparkles,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Star,
} from "lucide-react";

// Dummy candidate data
const dummyCandidates = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Senior Frontend Developer",
    email: "priya.sharma@email.com",
    phone: "+91 98765 43210",
    location: "Bangalore, India",
    experience: "5 years",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    status: "Interview",
    source: "LinkedIn",
    appliedDate: "2026-02-01",
    matchScore: 95,
    avatar: "",
  },
  {
    id: 2,
    name: "Rahul Verma",
    role: "Full Stack Developer",
    email: "rahul.verma@email.com",
    phone: "+91 87654 32109",
    location: "Mumbai, India",
    experience: "4 years",
    skills: ["Node.js", "React", "MongoDB", "AWS"],
    status: "Screening",
    source: "Naukri",
    appliedDate: "2026-01-28",
    matchScore: 88,
    avatar: "",
  },
  {
    id: 3,
    name: "Ananya Reddy",
    role: "UI/UX Designer",
    email: "ananya.reddy@email.com",
    phone: "+91 76543 21098",
    location: "Hyderabad, India",
    experience: "3 years",
    skills: ["Figma", "Adobe XD", "User Research", "Prototyping"],
    status: "Final Round",
    source: "Career Page",
    appliedDate: "2026-01-25",
    matchScore: 92,
    avatar: "",
  },
  {
    id: 4,
    name: "Vikram Singh",
    role: "DevOps Engineer",
    email: "vikram.singh@email.com",
    phone: "+91 65432 10987",
    location: "Delhi, India",
    experience: "6 years",
    skills: ["Kubernetes", "Docker", "AWS", "CI/CD", "Terraform"],
    status: "New",
    source: "Referral",
    appliedDate: "2026-02-05",
    matchScore: 90,
    avatar: "",
  },
  {
    id: 5,
    name: "Sneha Patel",
    role: "Product Manager",
    email: "sneha.patel@email.com",
    phone: "+91 54321 09876",
    location: "Pune, India",
    experience: "7 years",
    skills: ["Product Strategy", "Agile", "Data Analysis", "Stakeholder Management"],
    status: "Interview",
    source: "LinkedIn",
    appliedDate: "2026-01-30",
    matchScore: 87,
    avatar: "",
  },
];

const talentPoolData = [
  {
    id: 6,
    name: "Arjun Mehta",
    role: "Senior Backend Developer",
    email: "arjun.mehta@email.com",
    phone: "+91 43210 98765",
    location: "Bangalore, India",
    experience: "8 years",
    skills: ["Java", "Spring Boot", "Microservices", "PostgreSQL"],
    availability: "Immediate",
    lastEngaged: "2026-01-15",
    rating: 4.8,
    avatar: "",
  },
  {
    id: 7,
    name: "Kavya Krishnan",
    role: "Data Scientist",
    email: "kavya.krishnan@email.com",
    phone: "+91 32109 87654",
    location: "Chennai, India",
    experience: "5 years",
    skills: ["Python", "Machine Learning", "TensorFlow", "SQL"],
    availability: "2 weeks notice",
    lastEngaged: "2026-01-20",
    rating: 4.9,
    avatar: "",
  },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    New: "bg-info/10 text-info",
    Screening: "bg-warning/10 text-warning",
    Interview: "bg-accent/10 text-accent",
    "Final Round": "bg-success/10 text-success",
    Selected: "bg-success text-white",
    Rejected: "bg-danger/10 text-danger",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiSearchQuery, setAiSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold text-primary">
            Unified Candidate Hub
          </h1>
          <p className="mt-2 text-text-muted">
            Manage all candidates, talent pool, and bulk uploads in one place
          </p>
        </div>
        <Button className="bg-accent hover:bg-accent-hover">
          <Upload className="mr-2 h-4 w-4" />
          Quick Upload
        </Button>
      </div>

      {/* AI-Powered Search Section */}
      <Card className="border-accent/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-2xl">
            <Sparkles className="h-6 w-6 text-accent" />
            AI-Powered Resume Search
          </CardTitle>
          <CardDescription className="text-base">
            Search resumes using natural language or upload a Job Description for intelligent matching
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
              <Input
                placeholder='e.g., "Find senior developers with 5+ years in React and Node.js who have worked in fintech"'
                className="h-12 pl-10 text-base"
                value={aiSearchQuery}
                onChange={(e) => setAiSearchQuery(e.target.value)}
              />
            </div>
            <Button size="lg" className="bg-accent hover:bg-accent-hover">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Search
            </Button>
          </div>

          {/* Upload JD Zone */}
          <div className="rounded-lg border-2 border-dashed border-accent/30 bg-card p-6 text-center transition-colors hover:border-accent/50 hover:bg-accent/5">
            <FileText className="mx-auto h-10 w-10 text-accent mb-3" />
            <p className="font-semibold text-text">Upload Job Description</p>
            <p className="mt-1 text-sm text-text-muted">
              AI will match candidates to your JD (PDF, DOCX, TXT)
            </p>
            <Button variant="outline" className="mt-4">
              <Upload className="mr-2 h-4 w-4" />
              Choose File
            </Button>
          </div>

          {/* Example Queries */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-semibold text-text-muted">Examples:</span>
            {[
              "Python developers with ML experience",
              "UI/UX designers from top companies",
              "DevOps engineers who know Kubernetes",
            ].map((example) => (
              <Badge
                key={example}
                variant="outline"
                className="cursor-pointer hover:bg-accent/10"
                onClick={() => setAiSearchQuery(example)}
              >
                {example}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">All Candidates</TabsTrigger>
          <TabsTrigger value="talent-pool">Talent Pool</TabsTrigger>
          <TabsTrigger value="bulk-upload">Bulk Upload</TabsTrigger>
        </TabsList>

        {/* All Candidates Tab */}
        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <Input
                    placeholder="Search by name, role, or skills..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Candidates List */}
          <div className="grid gap-4">
            {dummyCandidates.map((candidate) => (
              <Card key={candidate.id} className="transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Left Section */}
                    <div className="flex gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={candidate.avatar} />
                        <AvatarFallback className="bg-accent text-white font-semibold text-lg">
                          {candidate.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-heading text-xl font-semibold text-primary">
                              {candidate.name}
                            </h3>
                            <Badge className={getStatusColor(candidate.status)}>
                              {candidate.status}
                            </Badge>
                          </div>
                          <p className="text-base text-text-muted">{candidate.role}</p>
                        </div>

                        {/* Contact Info */}
                        <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-4 w-4" />
                            {candidate.email}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-4 w-4" />
                            {candidate.phone}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {candidate.location}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="h-4 w-4" />
                            {candidate.experience}
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2">
                          {candidate.skills.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        {/* Meta Info */}
                        <div className="flex gap-4 text-xs text-text-muted">
                          <span>Applied: {candidate.appliedDate}</span>
                          <span>•</span>
                          <span>Source: {candidate.source}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-accent text-accent" />
                            Match: {candidate.matchScore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex flex-col gap-2">
                      <Button size="sm" className="bg-accent hover:bg-accent-hover">
                        View Profile
                      </Button>
                      <Button size="sm" variant="outline">
                        Schedule Interview
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Talent Pool Tab */}
        <TabsContent value="talent-pool" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-2xl">
                    Ready-to-Deploy Talent Pool
                  </CardTitle>
                  <CardDescription>
                    Pre-vetted candidates available for immediate hiring
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-success font-heading">
                    {talentPoolData.length}/6
                  </div>
                  <p className="text-sm text-text-muted">Target: 6 minimum</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {talentPoolData.map((candidate) => (
                <Card key={candidate.id} className="border-success/20 bg-success/5">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <Avatar className="h-16 w-16 border-2 border-success">
                          <AvatarImage src={candidate.avatar} />
                          <AvatarFallback className="bg-success text-white font-semibold text-lg">
                            {candidate.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="font-heading text-xl font-semibold text-primary">
                                {candidate.name}
                              </h3>
                              <Badge className="bg-success text-white">
                                Ready to Deploy
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-warning">
                                <Star className="h-4 w-4 fill-warning" />
                                <span className="font-semibold">{candidate.rating}</span>
                              </div>
                            </div>
                            <p className="text-base text-text-muted">{candidate.role}</p>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-4 w-4" />
                              {candidate.email}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-4 w-4" />
                              {candidate.phone}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4" />
                              {candidate.location}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="h-4 w-4" />
                              {candidate.experience}
                            </div>
                            <div className="flex items-center gap-1.5 text-success">
                              <Calendar className="h-4 w-4" />
                              {candidate.availability}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {candidate.skills.map((skill) => (
                              <Badge key={skill} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>

                          <p className="text-xs text-text-muted">
                            Last engaged: {candidate.lastEngaged}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button size="sm" className="bg-success hover:bg-success/90">
                          Deploy Now
                        </Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Upload Tab */}
        <TabsContent value="bulk-upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Bulk Resume Upload</CardTitle>
              <CardDescription>
                Upload multiple resumes at once for AI-powered processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Dropzone */}
              <div className="rounded-lg border-2 border-dashed border-border bg-background p-12 text-center transition-all hover:border-accent hover:bg-accent/5">
                <Upload className="mx-auto h-16 w-16 text-text-muted mb-4" />
                <h3 className="font-heading text-xl font-semibold text-primary mb-2">
                  Drop files here or click to upload
                </h3>
                <p className="text-text-muted mb-4">
                  Supports PDF, DOCX, TXT formats • Max 50 files per upload
                </p>
                <Button size="lg" className="bg-accent hover:bg-accent-hover">
                  <Upload className="mr-2 h-5 w-5" />
                  Select Files
                </Button>
              </div>

              <Separator />

              {/* Upload Instructions */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-info/20 bg-info/5">
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-info/10">
                      <FileText className="h-6 w-6 text-info" />
                    </div>
                    <h4 className="font-semibold text-primary mb-2">
                      1. Prepare Files
                    </h4>
                    <p className="text-sm text-text-muted">
                      Ensure all resumes are in PDF, DOCX, or TXT format
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-warning/20 bg-warning/5">
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                      <Sparkles className="h-6 w-6 text-warning" />
                    </div>
                    <h4 className="font-semibold text-primary mb-2">
                      2. AI Processing
                    </h4>
                    <p className="text-sm text-text-muted">
                      Our AI extracts skills, experience, and key information
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-success/20 bg-success/5">
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                      <Download className="h-6 w-6 text-success" />
                    </div>
                    <h4 className="font-semibold text-primary mb-2">
                      3. Review & Import
                    </h4>
                    <p className="text-sm text-text-muted">
                      Review parsed data and import to your candidate pool
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
