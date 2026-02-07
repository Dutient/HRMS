"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Upload,
  FileText,
  Sparkles,
  Filter,
  Download,
  Users,
  Briefcase,
  FileUp,
} from "lucide-react";
import { CandidateTable } from "@/components/candidates/candidate-table";
import { TalentPoolCard } from "@/components/candidates/talent-pool-card";
import { UploadZone } from "@/components/candidates/upload-zone";

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
  {
    id: 6,
    name: "Arjun Mehta",
    role: "Senior Backend Developer",
    email: "arjun.mehta@email.com",
    phone: "+91 43210 98765",
    location: "Bangalore, India",
    experience: "8 years",
    skills: ["Java", "Spring Boot", "Microservices", "PostgreSQL"],
    status: "Selected",
    source: "LinkedIn",
    appliedDate: "2026-01-15",
    matchScore: 96,
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
    status: "Selected",
    source: "Naukri",
    appliedDate: "2026-01-20",
    matchScore: 94,
    avatar: "",
  },
];

const talentPoolData = dummyCandidates.filter((c) => c.status === "Selected").map((c) => ({
  ...c,
  availability: c.id === 6 ? "Immediate" : "2 weeks notice",
  lastEngaged: c.id === 6 ? "2026-01-15" : "2026-01-20",
  rating: c.id === 6 ? 4.8 : 4.9,
}));

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiSearchQuery, setAiSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary">
            Unified Candidate Hub
          </h1>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-text-muted">
            Manage all candidates, talent pool, and bulk uploads in one place
          </p>
        </div>
        <Button className="bg-accent hover:bg-accent-hover w-full sm:w-auto shadow-lg">
          <Upload className="mr-2 h-4 w-4" />
          Quick Upload
        </Button>
      </div>

      {/* AI-Powered Search Section - Hero Feature */}
      <Card className="border-2 border-accent/30 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent shadow-xl">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="flex items-center gap-2 font-heading text-xl md:text-2xl">
            <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-accent" />
            AI-Powered Resume Search
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            Search resumes using natural language or upload a Job Description for intelligent matching
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-text-muted" />
              <Input
                placeholder='e.g., "Find senior developers with 5+ years in React and Node.js"'
                className="h-11 md:h-12 pl-9 md:pl-10 pr-4 text-sm md:text-base border-accent/20 focus:border-accent shadow-sm"
                value={aiSearchQuery}
                onChange={(e) => setAiSearchQuery(e.target.value)}
              />
            </div>
            <Button size="lg" className="bg-accent hover:bg-accent-hover shadow-lg h-11 md:h-12">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Search
            </Button>
          </div>

          {/* Upload JD Zone - Compact */}
          <div className="rounded-lg border-2 border-dashed border-accent/40 bg-card/50 p-4 md:p-6 text-center transition-all hover:border-accent/60 hover:bg-accent/5 cursor-pointer">
            <FileText className="mx-auto h-8 w-8 md:h-10 md:w-10 text-accent mb-2 md:mb-3" />
            <p className="font-semibold text-primary text-sm md:text-base">Upload Job Description</p>
            <p className="mt-1 text-xs md:text-sm text-text-muted">
              AI will match candidates to your JD (PDF, DOCX, TXT)
            </p>
            <Button variant="outline" size="sm" className="mt-3 border-accent/30 hover:bg-accent/10">
              <Upload className="mr-2 h-3 w-3 md:h-4 md:w-4" />
              Choose File
            </Button>
          </div>

          {/* Example Queries */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs md:text-sm font-semibold text-text-muted">Examples:</span>
            {[
              "Python developers with ML experience",
              "UI/UX designers from top companies",
              "DevOps engineers who know Kubernetes",
            ].map((example) => (
              <Badge
                key={example}
                variant="outline"
                className="cursor-pointer text-xs border-accent/30 hover:bg-accent/10 hover:border-accent"
                onClick={() => setAiSearchQuery(example)}
              >
                {example}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section with Premium Styling */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3 h-12 bg-primary/5 p-1">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-accent data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold"
          >
            <Users className="h-4 w-4 mr-2 hidden sm:inline" />
            <span className="text-xs sm:text-sm">All Candidates</span>
          </TabsTrigger>
          <TabsTrigger 
            value="talent-pool"
            className="data-[state=active]:bg-accent data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold"
          >
            <Briefcase className="h-4 w-4 mr-2 hidden sm:inline" />
            <span className="text-xs sm:text-sm">Talent Pool</span>
          </TabsTrigger>
          <TabsTrigger 
            value="bulk-upload"
            className="data-[state=active]:bg-accent data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold"
          >
            <FileUp className="h-4 w-4 mr-2 hidden sm:inline" />
            <span className="text-xs sm:text-sm">Bulk Upload</span>
          </TabsTrigger>
        </TabsList>

        {/* All Candidates Tab */}
        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4 md:pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <Input
                    placeholder="Search by name, role, or skills..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
                  <Filter className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                </Button>
                <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
                  <Download className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Candidates Table */}
          <CandidateTable
            candidates={dummyCandidates}
            onViewProfile={(id) => console.log("View profile:", id)}
            onScheduleInterview={(id) => console.log("Schedule interview:", id)}
          />
        </TabsContent>

        {/* Talent Pool Tab */}
        <TabsContent value="talent-pool" className="space-y-4">
          <Card className="border-success/20 bg-gradient-to-r from-success/5 to-transparent">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-heading text-xl md:text-2xl">
                    Ready-to-Deploy Talent Pool
                  </CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    Pre-vetted candidates available for immediate hiring
                  </CardDescription>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-2xl md:text-3xl font-extrabold text-success font-heading">
                    {talentPoolData.length}/6
                  </div>
                  <p className="text-xs md:text-sm text-text-muted">Target: 6 minimum</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:gap-6">
              {talentPoolData.map((candidate) => (
                <TalentPoolCard
                  key={candidate.id}
                  candidate={candidate}
                  onDeploy={(id) => console.log("Deploy candidate:", id)}
                  onViewDetails={(id) => console.log("View details:", id)}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Upload Tab */}
        <TabsContent value="bulk-upload">
          <UploadZone
            onFileSelect={(files) => {
              console.log("Files selected:", files.length);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
