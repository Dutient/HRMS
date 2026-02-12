import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, AlertCircle } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { BulkUploadZone } from "@/components/candidates/bulk-upload-zone";
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
            Upload multiple PDF resumes and automatically create candidate profiles
          </p>
        </div>
      </div>

      {/* Instructions Card */}
      <Card className="border-accent/20 bg-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent">
            <Sparkles className="h-5 w-5" />
            How Bulk Upload Works
          </CardTitle>
          <CardDescription>
            Streamline your candidate onboarding process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent font-semibold text-sm shrink-0">
              1
            </div>
            <div>
              <h4 className="font-semibold text-primary">Upload PDF Resumes</h4>
              <p className="text-sm text-text-muted">
                Drag and drop multiple PDF files or click to browse
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent font-semibold text-sm shrink-0">
              2
            </div>
            <div>
              <h4 className="font-semibold text-primary">Automatic Storage</h4>
              <p className="text-sm text-text-muted">
                Files are securely uploaded to Supabase Storage and accessible via public URLs
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent font-semibold text-sm shrink-0">
              3
            </div>
            <div>
              <h4 className="font-semibold text-primary">Instant Candidate Creation</h4>
              <p className="text-sm text-text-muted">
                New candidate profiles are automatically created with resume links
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert for File Format */}
      <Card className="border-info/20 bg-info/5">
        <CardContent className="flex items-start gap-3 pt-6">
          <AlertCircle className="h-5 w-5 text-info shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-info font-medium">
              <strong>Important:</strong> Only PDF files are supported for bulk upload. Maximum 50 files per upload.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Upload Zone */}
      <BulkUploadZone />
    </div>
  );
}