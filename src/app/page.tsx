import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  if (!authToken || authToken.value !== "authenticated") {
    redirect("/login");
  }

  const { count: totalCandidates } = await supabase
    .from("candidates")
    .select("*", { count: "exact", head: true });

  const { count: selectedCandidates } = await supabase
    .from("candidates")
    .select("*", { count: "exact", head: true })
    .eq("status", "Selected");

  const { data: recentCandidates } = await supabase
    .from("candidates")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: allCandidates } = await supabase
    .from("candidates")
    .select("id, position, job_opening, domain, role");

  const pipelineGroups: Record<string, {
    count: number;
    position: string;
    jobId: string;
    domain: string
  }> = {};

  let unassignedCount = 0;

  allCandidates?.forEach((c) => {
    if (!c.position && !c.job_opening && !c.domain) {
      unassignedCount++;
      return;
    }

    const position = c.position || "Unknown Position";
    const jobId = c.job_opening || "No Job ID";
    const domain = c.domain || "General";
    const key = `${position}|${jobId}|${domain}`;

    if (!pipelineGroups[key]) {
      pipelineGroups[key] = { count: 0, position, jobId, domain };
    }
    pipelineGroups[key].count++;
  });

  if (unassignedCount > 0) {
    pipelineGroups["unassigned"] = {
      count: unassignedCount,
      position: "Unassigned Candidates",
      jobId: "-",
      domain: "-"
    };
  }

  const sortedGroups = Object.values(pipelineGroups).sort((a, b) => b.count - a.count);
  const topGroups = sortedGroups.slice(0, 5);
  const selectionRate = totalCandidates ? Math.round(((selectedCandidates || 0) / totalCandidates) * 100) : 0;

  // Pipeline bar colors
  const barColors = [
    "bg-accent",
    "bg-info",
    "bg-success",
    "bg-warning",
    "bg-danger",
  ];

  // Avatar background colors
  const avatarColors = [
    "bg-accent text-primary",
    "bg-info text-white",
    "bg-success text-white",
    "bg-danger text-white",
    "bg-primary text-accent",
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-heading font-bold text-primary">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden border border-border">
          <div className="absolute top-0 left-0 right-0 h-1 bg-accent rounded-t-[--radius-md]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
            <CardTitle className="text-sm font-medium text-text-muted">Total Candidates</CardTitle>
            <span className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-accent" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalCandidates || 0}</div>
            <p className="text-xs text-text-muted mt-1">All candidates in system</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-border">
          <div className="absolute top-0 left-0 right-0 h-1 bg-success rounded-t-[--radius-md]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
            <CardTitle className="text-sm font-medium text-text-muted">Selection Rate</CardTitle>
            <span className="h-9 w-9 rounded-full bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-success" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{selectionRate}%</div>
            <p className="text-xs text-text-muted mt-1">Based on &apos;Selected&apos; status</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-border">
          <div className="absolute top-0 left-0 right-0 h-1 bg-info rounded-t-[--radius-md]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
            <CardTitle className="text-sm font-medium text-text-muted">Active Roles</CardTitle>
            <span className="h-9 w-9 rounded-full bg-info/10 flex items-center justify-center">
              <FileCheck className="h-4 w-4 text-info" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{Object.keys(pipelineGroups).length}</div>
            <p className="text-xs text-text-muted mt-1">Unique positions in pipeline</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border border-border">
          <CardHeader>
            <CardTitle className="text-primary font-heading">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCandidates && recentCandidates.length > 0 ? (
              <div className="space-y-3">
                {recentCandidates.map((candidate, i) => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between p-3 rounded-[--radius-sm] border border-border hover:border-accent/40 hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${avatarColors[i % avatarColors.length]}`}>
                        {candidate.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-primary">{candidate.name}</p>
                        <p className="text-xs text-text-muted">{candidate.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {candidate.status && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${candidate.status === "Selected"
                            ? "bg-success/10 text-success"
                            : candidate.status === "Rejected"
                              ? "bg-danger/10 text-danger"
                              : candidate.status === "In Review"
                                ? "bg-info/10 text-info"
                                : "bg-accent/10 text-accent"
                          }`}>
                          {candidate.status}
                        </span>
                      )}
                      <p className="text-xs text-text-muted">
                        {new Date(candidate.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-text-muted italic">
                No recent activity to display.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 border border-border">
          <CardHeader>
            <CardTitle className="text-primary font-heading">Pipeline Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedGroups.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {topGroups.map((group, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-primary truncate max-w-[180px]" title={group.position}>
                          {group.position}
                        </span>
                        {(group.jobId !== "-" || group.domain !== "-") && (
                          <span className="text-xs text-text-muted truncate max-w-[160px] block">
                            {group.jobId !== "-" ? group.jobId.replace(/^https?:\/\/(www\.)?/i, "").split("/")[0] + "/…" : ""}{group.domain !== "-" ? ` • ${group.domain}` : ""}
                          </span>
                        )}
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${i === 0 ? "bg-accent/15 text-accent"
                          : i === 1 ? "bg-info/15 text-info"
                            : i === 2 ? "bg-success/15 text-success"
                              : i === 3 ? "bg-warning/15 text-warning"
                                : "bg-danger/15 text-danger"
                        }`}>
                        {group.count}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColors[i % barColors.length]}`}
                        style={{ width: `${(group.count / (totalCandidates || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-text-muted italic">
                No pipeline data available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

