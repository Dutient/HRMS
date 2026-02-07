import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Briefcase,
  Calendar,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary">
          Dashboard
        </h1>
        <p className="mt-1 md:mt-2 text-base md:text-lg text-text-muted">
          Overview of your hiring pipeline and key metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="relative overflow-hidden border-l-4 transition-all hover:shadow-lg"
            style={{ borderLeftColor: stat.color }}
          >
            <CardContent className="pt-4 md:pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-medium text-text-muted">
                    {stat.label}
                  </p>
                  <p className="mt-1 md:mt-2 font-heading text-2xl md:text-3xl font-extrabold text-primary">
                    {stat.value}
                  </p>
                  <p className="mt-1 md:mt-2 flex items-center text-xs md:text-sm text-success">
                    <TrendingUp className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                    {stat.trend}
                  </p>
                </div>
                <div
                  className="rounded-full p-2 md:p-3 flex-shrink-0"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <stat.icon className="h-5 w-5 md:h-6 md:w-6" style={{ color: stat.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-accent/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-xl md:text-2xl">
            <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-accent" />
            Quick Actions
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            Get started with common tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto flex-col items-start gap-2 p-3 md:p-4 hover:border-accent hover:bg-accent/5"
              >
                <action.icon className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                <div className="text-left">
                  <p className="text-sm md:text-base font-semibold">{action.title}</p>
                  <p className="text-xs text-text-muted">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Pipeline */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Pipeline Status */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg md:text-xl">Hiring Pipeline</CardTitle>
            <CardDescription className="text-sm md:text-base">Candidates by stage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            {pipelineStages.map((stage) => (
              <div key={stage.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="font-medium">{stage.name}</span>
                  </div>
                  <span className="font-semibold text-primary">
                    {stage.count}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${stage.percentage}%`,
                      backgroundColor: stage.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg md:text-xl">Upcoming Interviews</CardTitle>
            <CardDescription className="text-sm md:text-base">Scheduled for this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            {upcomingInterviews.map((interview, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-border p-3 md:p-4 transition-colors hover:bg-background"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-accent/10 font-semibold text-accent text-sm md:text-base flex-shrink-0">
                    {interview.candidate.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-primary text-sm md:text-base truncate">
                      {interview.candidate}
                    </p>
                    <p className="text-xs md:text-sm text-text-muted truncate">{interview.role}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <p className="text-xs md:text-sm font-medium text-primary">
                    {interview.time}
                  </p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {interview.type}
                  </Badge>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Interviews
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const stats = [
  {
    label: "Active Candidates",
    value: "23",
    trend: "↑ 12% from last week",
    icon: Users,
    color: "#3B82F6",
  },
  {
    label: "Ready to Deploy",
    value: "8",
    trend: "Target: 6 minimum",
    icon: Briefcase,
    color: "#10B981",
  },
  {
    label: "Interviews Today",
    value: "5",
    trend: "3 completed",
    icon: Calendar,
    color: "#F59E0B",
  },
  {
    label: "Offers Extended",
    value: "12",
    trend: "↑ 4 this month",
    icon: TrendingUp,
    color: "#8B5CF6",
  },
];

const quickActions = [
  {
    title: "Add Candidate",
    description: "Manually add a new candidate",
    icon: Users,
  },
  {
    title: "Bulk Upload",
    description: "Upload multiple resumes",
    icon: Briefcase,
  },
  {
    title: "Schedule Interview",
    description: "Set up a new interview",
    icon: Calendar,
  },
];

const pipelineStages = [
  { name: "New Applications", count: 8, percentage: 80, color: "#3B82F6" },
  { name: "Screening", count: 6, percentage: 60, color: "#F59E0B" },
  { name: "Interview", count: 5, percentage: 50, color: "#8B5CF6" },
  { name: "Final Round", count: 4, percentage: 40, color: "#10B981" },
];

const upcomingInterviews = [
  {
    candidate: "Priya Sharma",
    role: "Frontend Developer",
    time: "Today, 2:00 PM",
    type: "Technical",
  },
  {
    candidate: "Rahul Verma",
    role: "Full Stack Developer",
    time: "Today, 4:30 PM",
    type: "HR Round",
  },
  {
    candidate: "Ananya Reddy",
    role: "UI/UX Designer",
    time: "Tomorrow, 11:00 AM",
    type: "Final Round",
  },
];

