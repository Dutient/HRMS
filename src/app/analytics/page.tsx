import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Briefcase,
  BarChart3
} from "lucide-react";
import { getKeyMetrics, getSourcePerformance, getRolePipeline } from "@/app/actions/get-analytics";
import { isSupabaseConfigured } from "@/lib/supabase";
import { SupabaseSetupBanner } from "@/components/candidates/supabase-setup-banner";

export default async function AnalyticsPage() {
  const keyMetrics = await getKeyMetrics();
  const sourcePerformance = await getSourcePerformance();
  const rolePipeline = await getRolePipeline();

  return (
    <div className="space-y-6">
      {/* Supabase Setup Warning */}
      {!isSupabaseConfigured && <SupabaseSetupBanner />}

      {/* Page Header */}
      <div className="flex items-center justify-between flex-col md:flex-row gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold text-primary">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-text-muted">
            Track hiring performance and recruitment metrics
          </p>
        </div>
      </div>

      {/* Key Metrics - 4 Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{keyMetrics.totalCandidates}</div>
            <p className="text-xs text-text-muted mt-1">
              All-time candidate submissions
            </p>
          </CardContent>
        </Card>

        <Card className="border-info/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Interviews</CardTitle>
            <Calendar className="h-5 w-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{keyMetrics.activeInterviews}</div>
            <p className="text-xs text-text-muted mt-1">
              Candidates in interview stage
            </p>
          </CardContent>
        </Card>

        <Card className="border-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hired</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{keyMetrics.selectedCandidates}</div>
            <p className="text-xs text-text-muted mt-1">
              Successfully recruited candidates
            </p>
          </CardContent>
        </Card>

        <Card className="border-danger/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejection Rate</CardTitle>
            <XCircle className="h-5 w-5 text-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{keyMetrics.rejectionRate}%</div>
            <p className="text-xs text-text-muted mt-1">
              Percentage of rejected applications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Source Performance Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              <CardTitle className="font-heading text-2xl">Source Performance</CardTitle>
            </div>
            <CardDescription>
              Track which recruitment channels are most effective
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sourcePerformance.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-text-muted mb-3" />
                <p className="text-text-muted">No source data available yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Applicants</TableHead>
                    <TableHead className="text-right">Hired</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sourcePerformance.map((source, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {source.source}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{source.applicants}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-success/10 text-success">
                          {source.hired}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Role Pipeline Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <CardTitle className="font-heading text-2xl">Role Pipeline</CardTitle>
            </div>
            <CardDescription>
              Candidates distribution across roles and stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rolePipeline.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="mx-auto h-12 w-12 text-text-muted mb-3" />
                <p className="text-text-muted">No role data available yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-center">Applied</TableHead>
                    <TableHead className="text-center">Interview</TableHead>
                    <TableHead className="text-center">Selected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rolePipeline.map((role, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {role.role}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{role.Applied}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-info/10 text-info">{role.Interview}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-success/10 text-success">{role.Selected}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
