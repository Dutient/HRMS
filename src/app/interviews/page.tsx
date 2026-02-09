import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  User,
  Video,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  Star,
} from "lucide-react";
import { getAllInterviews } from "@/app/actions/get-interviews";
import { FeedbackDialog } from "@/components/interviews/feedback-dialog";
import { isSupabaseConfigured } from "@/lib/supabase";
import { SupabaseSetupBanner } from "@/components/candidates/supabase-setup-banner";

const getInterviewTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    Screening: "bg-info/10 text-info",
    Technical: "bg-accent/10 text-accent",
    Final: "bg-warning/10 text-warning",
    HR: "bg-success/10 text-success",
  };
  return colors[type] || "bg-gray-100 text-gray-800";
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    Scheduled: "bg-info/10 text-info",
    Completed: "bg-success/10 text-success",
    Cancelled: "bg-danger/10 text-danger",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

export default async function InterviewsPage() {
  const interviews = await getAllInterviews();

  // Group interviews
  const now = new Date();
  const upcomingInterviews = interviews.filter(
    (interview) => new Date(interview.interview_date) >= now && interview.status === "Scheduled"
  );
  const pastInterviews = interviews.filter(
    (interview) => new Date(interview.interview_date) < now || interview.status !== "Scheduled"
  );

  return (
    <div className="space-y-6">
      {/* Supabase Setup Warning */}
      {!isSupabaseConfigured && <SupabaseSetupBanner />}

      {/* Page Header */}
      <div className="flex items-center justify-between flex-col md:flex-row gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold text-primary">
            Interview Management
          </h1>
          <p className="mt-2 text-text-muted">
            Track scheduled interviews and manage candidate feedback
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-base px-4 py-2">
            {upcomingInterviews.length} Upcoming
          </Badge>
          <Badge variant="secondary" className="text-base px-4 py-2">
            {pastInterviews.length} Past
          </Badge>
        </div>
      </div>

      {/* Upcoming Interviews */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Upcoming Interviews</CardTitle>
            <CardDescription>
              Scheduled interviews that are yet to happen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingInterviews.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-16 w-16 text-text-muted mb-4" />
                <h3 className="font-heading text-xl font-semibold text-primary mb-2">
                  No upcoming interviews
                </h3>
                <p className="text-text-muted">
                  Schedule interviews with candidates to see them here
                </p>
              </div>
            ) : (
              upcomingInterviews.map((interview) => {
                const { date, time } = formatDateTime(interview.interview_date);
                return (
                  <Card key={interview.id} className="border-accent/20 bg-accent/5">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between flex-col md:flex-row gap-4">
                        <div className="flex gap-4 flex-1">
                          <Avatar className="h-16 w-16 shrink-0">
                            <AvatarImage src={interview.candidate?.avatar_url || ""} />
                            <AvatarFallback className="bg-accent text-white font-semibold text-lg">
                              {interview.candidate?.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>

                          <div className="space-y-3 flex-1">
                            <div>
                              <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="font-heading text-xl font-semibold text-primary">
                                  {interview.candidate?.name || "Unknown Candidate"}
                                </h3>
                                <Badge className={getInterviewTypeColor(interview.interview_type)}>
                                  {interview.interview_type}
                                </Badge>
                                <Badge className={getStatusColor(interview.status)}>
                                  {interview.status}
                                </Badge>
                              </div>
                              <p className="text-base text-text-muted">
                                {interview.candidate?.role || "No role specified"}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {date}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {time}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <User className="h-4 w-4" />
                                {interview.interviewer_name}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 w-full md:w-auto">
                          {interview.meeting_link && (
                            <Button
                              asChild
                              size="sm"
                              className="bg-accent hover:bg-accent-hover"
                            >
                              <a
                                href={interview.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Video className="mr-2 h-4 w-4" />
                                Join Meeting
                                <ExternalLink className="ml-2 h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </CardContent>
        </Card>
      </section>

      {/* Past Interviews */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Past Interviews</CardTitle>
            <CardDescription>
              Completed and cancelled interviews
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pastInterviews.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-16 w-16 text-text-muted mb-4" />
                <h3 className="font-heading text-xl font-semibold text-primary mb-2">
                  No past interviews
                </h3>
                <p className="text-text-muted">
                  Completed interviews will appear here
                </p>
              </div>
            ) : (
              pastInterviews.map((interview) => {
                const { date, time } = formatDateTime(interview.interview_date);
                const hasFeedback = interview.feedback_score !== null;

                return (
                  <Card key={interview.id} className="border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between flex-col md:flex-row gap-4">
                        <div className="flex gap-4 flex-1">
                          <Avatar className="h-16 w-16 shrink-0">
                            <AvatarImage src={interview.candidate?.avatar_url || ""} />
                            <AvatarFallback className="bg-primary text-white font-semibold text-lg">
                              {interview.candidate?.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>

                          <div className="space-y-3 flex-1">
                            <div>
                              <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="font-heading text-xl font-semibold text-primary">
                                  {interview.candidate?.name || "Unknown Candidate"}
                                </h3>
                                <Badge className={getInterviewTypeColor(interview.interview_type)}>
                                  {interview.interview_type}
                                </Badge>
                                <Badge className={getStatusColor(interview.status)}>
                                  {interview.status}
                                </Badge>
                                {hasFeedback && (
                                  <Badge className="bg-success/10 text-success">
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Feedback Added
                                  </Badge>
                                )}
                              </div>
                              <p className="text-base text-text-muted">
                                {interview.candidate?.role || "No role specified"}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {date}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {time}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <User className="h-4 w-4" />
                                {interview.interviewer_name}
                              </div>
                              {hasFeedback && interview.feedback_score && (
                                <div className="flex items-center gap-1.5 text-warning">
                                  <Star className="h-4 w-4 fill-warning" />
                                  {interview.feedback_score}/5
                                </div>
                              )}
                            </div>

                            {hasFeedback && interview.feedback_notes && (
                              <div className="bg-gray-50 rounded-md p-3 text-sm text-text-muted">
                                <p className="font-semibold text-primary mb-1">Feedback:</p>
                                <p className="whitespace-pre-wrap">{interview.feedback_notes}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 w-full md:w-auto">
                          {!hasFeedback && interview.status === "Scheduled" && (
                            <FeedbackDialog
                              interviewId={interview.id}
                              candidateName={interview.candidate?.name || "Unknown"}
                              interviewType={interview.interview_type}
                            />
                          )}
                          {interview.meeting_link && (
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                            >
                              <a
                                href={interview.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Video className="mr-2 h-4 w-4" />
                                Recording
                                <ExternalLink className="ml-2 h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
