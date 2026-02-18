import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, Calendar, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    // const supabase = await createClient(); // Not using SSR client for now as setup is simple

    if (!supabase) {
        return (
            <div className="p-8 text-center text-red-500">
                Supabase not configured. Please check your environment variables.
            </div>
        );
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch real data
    const { count: totalCandidates } = await supabase
        .from("candidates")
        .select("*", { count: "exact", head: true });

    const { count: offerCandidates } = await supabase
        .from("candidates")
        .select("*", { count: "exact", head: true })
        .eq("status", "Offer");

    // Mock data for now as we don't have interviews table yet
    const interviewsToday = 0;
    const selectionRate = totalCandidates ? Math.round(((offerCandidates || 0) / totalCandidates) * 100) : 0;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-heading font-bold text-primary">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Candidates */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCandidates || 0}</div>
                        <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                </Card>

                {/* Selection Rate */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Selection Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{selectionRate}%</div>
                        <p className="text-xs text-muted-foreground">Based on offers given</p>
                    </CardContent>
                </Card>

                {/* Interviews Today */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Interviews Today</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{interviewsToday}</div>
                        <p className="text-xs text-muted-foreground">No interviews scheduled</p>
                    </CardContent>
                </Card>

                {/* Offers Extended */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Offers Extended</CardTitle>
                        <FileCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{offerCandidates || 0}</div>
                        <p className="text-xs text-muted-foreground">Candidates in 'Offer' stage</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-[200px] text-muted-foreground italic">
                            No recent activity to display.
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Upcoming Interviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-[200px] text-muted-foreground italic">
                            No upcoming interviews.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
