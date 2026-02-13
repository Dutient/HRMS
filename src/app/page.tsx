import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, Calendar, TrendingUp, ArrowRight, Plus, Upload } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import Link from "next/link";
import { format } from "date-fns";

async function getDashboardData() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      totalCandidates: 0,
      recentCandidates: [],
    };
  }

  // Fetch total candidates count
  const { count: totalCandidates } = await supabase
    .from("candidates")
    .select("*", { count: "exact", head: true });

  // Fetch 5 most recent candidates
  const { data: recentCandidates } = await supabase
    .from("candidates")
    .select("id, name, role, applied_date")
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    totalCandidates: totalCandidates || 0,
    recentCandidates: recentCandidates || [],
  };
}

export default async function Home() {
  const { totalCandidates, recentCandidates } = await getDashboardData();

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary">
          Dashboard
        </h1>
        <p className="mt-1 md:mt-2 text-base md:text-lg text-text-muted">
          Overview of your hiring pipeline and key metrics
        </p>
      </div>

      {/* Metrics Grid - 4 Cards */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Candidates (Real Data) */}
        <Card className="relative overflow-hidden border-l-4" style={{ borderLeftColor: "#3B82F6" }}>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs md:text-sm font-medium text-text-muted">
                  Total Candidates
                </p>
                <p className="mt-1 md:mt-2 font-heading text-2xl md:text-3xl font-extrabold text-primary">
                  {totalCandidates}
                </p>
                <p className="mt-1 md:mt-2 flex items-center text-xs md:text-sm text-success">
                  <TrendingUp className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                  Active pipeline
                </p>
              </div>
              <div
                className="rounded-full p-2 md:p-3 flex-shrink-0"
                style={{ backgroundColor: "#3B82F620" }}
              >
                <Users className="h-5 w-5 md:h-6 md:w-6" style={{ color: "#3B82F6" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Ready to Deploy */}
        <Card className="relative overflow-hidden border-l-4" style={{ borderLeftColor: "#10B981" }}>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs md:text-sm font-medium text-text-muted">
                  Ready to Deploy
                </p>
                <p className="mt-1 md:mt-2 font-heading text-2xl md:text-3xl font-extrabold text-primary">
                  0
                </p>
                <p className="mt-1 md:mt-2 flex items-center text-xs md:text-sm text-text-muted">
                  Target: 6 minimum
                </p>
              </div>
              <div
                className="rounded-full p-2 md:p-3 flex-shrink-0"
                style={{ backgroundColor: "#10B98120" }}
              >
                <Briefcase className="h-5 w-5 md:h-6 md:w-6" style={{ color: "#10B981" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Interviews Today */}
        <Card className="relative overflow-hidden border-l-4" style={{ borderLeftColor: "#F59E0B" }}>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs md:text-sm font-medium text-text-muted">
                  Interviews Today
                </p>
                <p className="mt-1 md:mt-2 font-heading text-2xl md:text-3xl font-extrabold text-primary">
                  0
                </p>
                <p className="mt-1 md:mt-2 flex items-center text-xs md:text-sm text-text-muted">
                  No interviews scheduled
                </p>
              </div>
              <div
                className="rounded-full p-2 md:p-3 flex-shrink-0"
                style={{ backgroundColor: "#F59E0B20" }}
              >
                <Calendar className="h-5 w-5 md:h-6 md:w-6" style={{ color: "#F59E0B" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Selection Rate */}
        <Card className="relative overflow-hidden border-l-4" style={{ borderLeftColor: "#8B5CF6" }}>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs md:text-sm font-medium text-text-muted">
                  Selection Rate
                </p>
                <p className="mt-1 md:mt-2 font-heading text-2xl md:text-3xl font-extrabold text-primary">
                  12%
                </p>
                <p className="mt-1 md:mt-2 flex items-center text-xs md:text-sm text-success">
                  <TrendingUp className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                  Industry average
                </p>
              </div>
              <div
                className="rounded-full p-2 md:p-3 flex-shrink-0"
                style={{ backgroundColor: "#8B5CF620" }}
              >
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6" style={{ color: "#8B5CF6" }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid: Recent Activity + Quick Actions */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {/* Recent Activity - Takes 2 columns on larger screens */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading text-xl md:text-2xl">Recent Candidates</CardTitle>
            <CardDescription>Latest additions to your talent pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCandidates.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-text-muted mb-3" />
                <p className="text-text-muted">No candidates yet</p>
                <p className="text-sm text-text-muted mt-1">
                  Start by adding candidates or uploading resumes
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {recentCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-background transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 font-semibold text-accent text-sm flex-shrink-0">
                          {candidate.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-primary truncate">
                            {candidate.name}
                          </p>
                          <p className="text-sm text-text-muted truncate">{candidate.role}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-xs text-text-muted">
                          {format(new Date(candidate.applied_date), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/candidates">
                  <Button variant="outline" className="w-full mt-4">
                    View All Candidates
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions - Takes 1 column */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl md:text-2xl">Quick Actions</CardTitle>
            <CardDescription>Common recruitment tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/candidates">
              <Button className="w-full bg-accent hover:bg-accent-hover">
                <Plus className="mr-2 h-4 w-4" />
                Add New Candidate
              </Button>
            </Link>
            <Link href="/bulk-upload">
              <Button variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Bulk Upload Resumes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

