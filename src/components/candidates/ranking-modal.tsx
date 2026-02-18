"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";

interface RankingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRank: (jobDescription: string) => Promise<void>;
    loading: boolean;
    count: number;
}

export function RankingModal({
    open,
    onOpenChange,
    onRank,
    loading,
    count,
}: RankingModalProps) {
    const [jobDescription, setJobDescription] = useState("");

    const handleRank = async () => {
        if (!jobDescription.trim()) return;
        await onRank(jobDescription);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Rank Candidates with AI</DialogTitle>
                    <DialogDescription>
                        Paste the job description below to rank the <strong>{count}</strong> filtered candidates based on relevance.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="jd" className="text-left">
                            Job Description
                        </Label>
                        <Textarea
                            id="jd"
                            placeholder="Paste job description here..."
                            className="h-[200px]"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleRank} disabled={!jobDescription.trim() || loading} className="bg-purple-600 hover:bg-purple-700">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Ranking...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Start AI Ranking
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
