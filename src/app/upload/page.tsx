"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { processAndStoreResume } from "@/app/actions/ingestResume";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function UploadPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setResult(null);

        const formData = new FormData(event.currentTarget);
        const response = await processAndStoreResume(formData);

        setResult(response);
        setLoading(false);

        if (response.success) {
            // Optional: Reset form
            (event.target as HTMLFormElement).reset();
        }
    }

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Upload Candidate Resume</CardTitle>
                    <CardDescription>
                        Upload a PDF resume to parse, generate embeddings, and store in the database.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Candidate Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="John Doe"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="file">Resume (PDF)</Label>
                            <Input
                                id="file"
                                name="file"
                                type="file"
                                accept=".pdf"
                                required
                                disabled={loading}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading and Vectorizing...
                                </>
                            ) : (
                                "Upload and Process"
                            )}
                        </Button>

                        {result && (
                            <div
                                className={`p-4 rounded-md flex items-center gap-2 ${result.success
                                        ? "bg-green-50 text-green-700 border border-green-200"
                                        : "bg-red-50 text-red-700 border border-red-200"
                                    }`}
                            >
                                {result.success ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                    <AlertCircle className="h-5 w-5" />
                                )}
                                <span>{result.message}</span>
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
