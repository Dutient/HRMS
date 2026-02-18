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
import { Loader2, Sparkles, UploadCloud } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDropzone } from "react-dropzone";
import { parseJobDescription } from "@/app/actions/parse-job-description";

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
    const [mode, setMode] = useState<"text" | "file">("file");
    const [isParsing, setIsParsing] = useState(false);

    const onDrop = async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        const file = acceptedFiles[0];
        setIsParsing(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const result = await parseJobDescription(formData);
            if (result.success && result.text) {
                setJobDescription(result.text);
                // Switch to text mode to show the extracted text
                setMode("text");
            } else {
                alert(result.message || "Failed to parse file");
            }
        } catch (error) {
            console.error(error);
            alert("Error parsing file");
        } finally {
            setIsParsing(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt']
        },
        maxFiles: 1,
        disabled: isParsing
    });

    const handleRank = async () => {
        if (!jobDescription.trim()) return;
        await onRank(jobDescription);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Rank Candidates with AI</DialogTitle>
                    <DialogDescription>
                        Upload a Job Description or paste text to rank the <strong>{count}</strong> candidates.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={mode} onValueChange={(v) => setMode(v as "text" | "file")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="file">File Upload</TabsTrigger>
                        <TabsTrigger value="text">Manual Entry</TabsTrigger>
                    </TabsList>

                    <TabsContent value="file">
                        <div
                            {...getRootProps()}
                            className={`
                                border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
                                ${isDragActive ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-purple-400"}
                                ${isParsing ? "opacity-50 cursor-not-allowed" : ""}
                            `}
                        >
                            <input {...getInputProps()} />
                            {isParsing ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                                    <p className="text-sm text-gray-500">Parsing document...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <UploadCloud className="h-10 w-10 text-gray-400" />
                                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-500">PDF, DOCX, or TXT (Max 10MB)</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="text">
                        <div className="grid gap-2">
                            <Label htmlFor="jd" className="text-left">
                                Job Description Text
                            </Label>
                            <Textarea
                                id="jd"
                                placeholder="Paste job description here..."
                                className="h-[200px]"
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleRank} disabled={!jobDescription.trim() || loading || isParsing} className="bg-purple-600 hover:bg-purple-700">
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
