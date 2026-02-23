import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, AlertCircle, Upload, Database, UserCheck } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { BulkUploadZone } from "@/components/candidates/bulk-upload-zone";
import { SupabaseSetupBanner } from "@/components/candidates/supabase-setup-banner";

const steps = [
  {
    icon: Upload,
    number: "1",
    title: "Upload PDF Resumes",
    description: "Drag and drop multiple PDF files or click to browse your device",
    color: "accent",
  },
  {
    icon: Database,
    number: "2",
    title: "Automatic Storage",
    description: "Files are securely uploaded to Supabase Storage with public URLs",
    color: "info",
  },
  {
    icon: UserCheck,
    number: "3",
    title: "Instant Candidate Creation",
    description: "New candidate profiles are automatically created with resume links",
    color: "success",
  },
];

export default function BulkUploadPage() {
  return (
    <div className="space-y-6">
      {!isSupabaseConfigured && <SupabaseSetupBanner />}

      {/* Page Header */}
      <div className="flex items-start justify-between flex-col md:flex-row gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              AI-Powered
            </span>
          </div>
          <h1 className="font-heading text-4xl font-bold text-primary">
            Resume Bulk Upload
          </h1>
          <p className="mt-2 text-text-muted max-w-lg">
            Upload multiple PDF resumes and automatically create candidate profiles — no manual entry needed.
          </p>
        </div>
      </div>

      {/* How it works — horizontal card strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map(({ icon: Icon, number, title, description, color }) => (
          <Card
            key={number}
            className={`relative overflow-hidden border border-border group hover:border-${color}/40 transition-colors`}
          >
            {/* top accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-${color} rounded-t-[--radius-md]`} />
            <CardHeader className="pb-2 pt-5 flex flex-row items-start gap-3 space-y-0">
              <span
                className={`h-9 w-9 rounded-full bg-${color}/10 flex items-center justify-center shrink-0`}
              >
                <Icon className={`h-4 w-4 text-${color}`} />
              </span>
              <div>
                <p className={`text-xs font-bold text-${color} mb-0.5`}>Step {number}</p>
                <CardTitle className="text-sm font-semibold text-primary leading-snug">
                  {title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-muted">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info banner */}
      <div className="flex items-center gap-3 rounded-[--radius-sm] border border-info/25 bg-info/5 px-4 py-3">
        <AlertCircle className="h-4 w-4 text-info shrink-0" />
        <p className="text-sm text-info">
          <strong>Heads up:</strong> Only PDF files are supported. Maximum 50 files per upload session.
        </p>
      </div>

      {/* Upload Zone */}
      <BulkUploadZone />
    </div>
  );
}