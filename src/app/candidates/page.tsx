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
} from "lucide-react";
import { getCandidates, getTalentPoolCandidates } from "@/app/actions/get-candidates";
import { isSupabaseConfigured } from "@/lib/supabase";
import { CandidatesList } from "@/components/candidates/candidates-list";
import { TalentPoolList } from "@/components/candidates/talent-pool-list";
import { UploadZone } from "@/components/candidates/upload-zone";
import { SupabaseSetupBanner } from "@/components/candidates/supabase-setup-banner";

export default async function CandidatesPage() {
  // Fetch data from Supabase
  const allCandidates = await getCandidates();
  const talentPoolCandidates = await getTalentPoolCandidates();

  return (
    <div className="space-y-6">
      {/* Supabase Setup Warning */}
      {!isSupabaseConfigured && <SupabaseSetupBanner />}

      {/* Page Header */}
      <div className="flex items-center justify-between flex-col md:flex-row gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold text-primary">
            Unified Candidate Hub
          </h1>
          <p className="mt-2 text-text-muted">
            Manage all candidates, talent pool, and bulk uploads in one place
          </p>
        </div>
        <Button className="bg-accent hover:bg-accent-hover w-full md:w-auto">
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
          <div className="flex gap-3 flex-col md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
              <Input
                placeholder='e.g., "Find senior developers with 5+ years in React and Node.js"'
                className="h-12 pl-10 text-base"
              />
            </div>
            <Button size="lg" className="bg-accent hover:bg-accent-hover w-full md:w-auto">
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
          <TabsTrigger value="all">
            All Candidates
            {allCandidates.length > 0 && (
              <Badge variant="secondary" className="ml-2 min-w-[20px] justify-center">
                {allCandidates.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="talent-pool">
            Talent Pool
            {talentPoolCandidates.length > 0 && (
              <Badge variant="secondary" className="ml-2 min-w-[20px] justify-center">
                {talentPoolCandidates.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="bulk-upload">Bulk Upload</TabsTrigger>
        </TabsList>

        {/* All Candidates Tab */}
        <TabsContent value="all" className="space-y-4">
          <CandidatesList candidates={allCandidates} />
        </TabsContent>

        {/* Talent Pool Tab */}
        <TabsContent value="talent-pool" className="space-y-4">
          <TalentPoolList candidates={talentPoolCandidates} />
        </TabsContent>

        {/* Bulk Upload Tab */}
        <TabsContent value="bulk-upload">
          <UploadZone />
        </TabsContent>
      </Tabs>
    </div>
  );
}
