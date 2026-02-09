import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { getTalentPoolCandidates } from "@/app/actions/get-candidates";
import { isSupabaseConfigured } from "@/lib/supabase";
import { TalentPoolList } from "@/components/candidates/talent-pool-list";
import { SupabaseSetupBanner } from "@/components/candidates/supabase-setup-banner";

export default async function TalentPoolPage() {
  const talentPoolCandidates = await getTalentPoolCandidates();

  return (
    <div className="space-y-6">
      {/* Supabase Setup Warning */}
      {!isSupabaseConfigured && <SupabaseSetupBanner />}

      {/* Page Header */}
      <div className="flex items-center justify-between flex-col md:flex-row gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold text-primary">
            Talent Pool
          </h1>
          <p className="mt-2 text-text-muted">
            High-potential candidates for future opportunities
          </p>
        </div>
        <Badge variant="secondary" className="text-base px-4 py-2">
          <Users className="mr-2 h-4 w-4" />
          {talentPoolCandidates.length} Candidate{talentPoolCandidates.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Talent Pool List */}
      <TalentPoolList candidates={talentPoolCandidates} />
    </div>
  );
}
