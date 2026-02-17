"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { matchCandidates, type MatchResult } from "@/app/actions/matchCandidates";
import { Loader2, Zap, Briefcase, User } from "lucide-react";

export default function MatchPage() {
    const [jd, setJd] = useState("");
    const [results, setResults] = useState<MatchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleMatch() {
        if (!jd.trim()) return;

        setLoading(true);
        setError(null);
        setResults([]);

        try {
            const matches = await matchCandidates(jd);
            setResults(matches);
            if (matches.length === 0) {
                setError("No candidates found matching the criteria. Try uploading more resumes or broadening your search.");
            }
        } catch (err) {
            setError("Failed to match candidates. Ensure you have candidates with embeddings in the database.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container mx-auto py-10 max-w-4xl space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">AI Matching Engine</h1>
                <p className="text-muted-foreground">
                    Analyze candidates against a job description using semantic search and Claude 3.5 Sonnet ranking.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Input Section */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-primary" />
                            Job Description
                        </CardTitle>
                        <CardDescription>
                            Paste the job description or critical requirements here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            placeholder="e.g. Seeking a Senior Frontend Engineer with 5+ years of React experience, Node.js knowledge, and experience with AWS..."
                            className="min-h-[300px] resize-none font-mono text-sm"
                            value={jd}
                            onChange={(e) => setJd(e.target.value)}
                        />
                        <Button
                            onClick={handleMatch}
                            disabled={loading || !jd.trim()}
                            className="w-full"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing Candidates...
                                </>
                            ) : (
                                <>
                                    <Zap className="mr-2 h-4 w-4" />
                                    Find Top Matches
                                </>
                            )}
                        </Button>
                        {error && (
                            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                {error}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Results Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        Top Assignments
                        {results.length > 0 && <Badge variant="secondary">{results.length}</Badge>}
                    </h2>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="opacity-50 animate-pulse">
                                    <CardContent className="h-32" />
                                </Card>
                            ))}
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-4">
                            {results.map((candidate) => (
                                <Card key={candidate.candidateId} className="overflow-hidden border-l-4 border-l-primary transition-all hover:shadow-md">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <h3 className="font-semibold text-lg">{candidate.name}</h3>
                                            </div>
                                            <Badge
                                                variant={candidate.matchScore >= 80 ? "default" : candidate.matchScore >= 60 ? "secondary" : "outline"}
                                                className="text-lg py-1 px-3"
                                            >
                                                {candidate.matchScore}% Match
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                                            <div>
                                                <span className="font-medium text-foreground">Role:</span> {candidate.role}
                                            </div>
                                            <div>
                                                <span className="font-medium text-foreground">Email:</span> {candidate.email}
                                            </div>
                                        </div>

                                        <div className="bg-muted/50 p-4 rounded-lg text-sm italic border border-border/50">
                                            "{candidate.justification}"
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-lg text-muted-foreground p-8 text-center bg-muted/10">
                            <Zap className="h-8 w-8 mb-4 opacity-20" />
                            <p>Enter a job description to see ranked candidates.</p>
                            <p className="text-sm mt-2 max-w-xs opacity-70">
                                Make sure you have uploaded candidates first using the Upload page.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
