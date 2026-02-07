import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload } from "lucide-react";
import { getCandidates, getTalentPoolCandidates } from "@/app/actions/get-candidates";
import { isSupabaseConfigured } from "@/lib/supabase";
import { CandidatesList } from "@/components/candidates/candidates-list";
import { TalentPoolList } from "@/components/candidates/talent-pool-list";
import { UploadZone } from "@/components/candidates/upload-zone";
import { SupabaseSetupBanner } from "@/components/candidates/supabase-setup-banner";
import { AISearchPanel } from "@/components/candidates/ai-search-panel";

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

      {/* AI Smart Search & Ranking */}
      <AISearchPanel />

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
