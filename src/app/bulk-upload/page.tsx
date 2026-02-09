import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Sparkles, AlertCircle } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { UploadZone } from "@/components/candidates/upload-zone";
import { SupabaseSetupBanner } from "@/components/candidates/supabase-setup-banner";

export default function BulkUploadPage() {
  return (
    <div className="space-y-6">
      {/* Supabase Setup Warning */}
      {!isSupabaseConfigured && <SupabaseSetupBanner />}

      {/* Page Header */}
      <div className="flex items-center justify-between flex-col md:flex-row gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold text-primary">
            Resume Bulk Upload
          </h1>
          <p className="mt-2 text-text-muted">
            Upload multiple resumes and let AI parse candidate information
          </p>
        </div>
      </div>

      {/* Instructions Card */}
      <Card className="border-accent/20 bg-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent">
            <Sparkles className="h-5 w-5" />
            How AI Resume Parsing Works
          </CardTitle>
          <CardDescription>
            Our AI-powered system automatically extracts candidate information from resumes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <Upload className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-primary">1. Upload Files</h3>
                <p className="text-sm text-text-muted">
                  Drop PDF or DOCX files (up to 100 at once)
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-primary">2. AI Processing</h3>
                <p className="text-sm text-text-muted">
                  Gemini 1.5 Flash extracts name, role, skills, etc.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <FileText className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-primary">3. Auto-Save</h3>
                <p className="text-sm text-text-muted">
                  Candidates are saved to your database instantly
                </p>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="rounded-lg bg-info/10 border border-info/20 p-4 mt-4">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-info shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-semibold text-primary">Pro Tips:</p>
                <ul className="text-sm text-text-muted space-y-1 list-disc list-inside">
                  <li>Use clear, well-formatted resumes for best results</li>
                  <li>File names don&apos;t matter - AI reads the content</li>
                  <li>Processing happens sequentially to ensure accuracy</li>
                  <li>Failed uploads can be retried individually</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Zone */}
      <UploadZone />
    </div>
  );
}
