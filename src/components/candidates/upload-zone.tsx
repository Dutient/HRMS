"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, Sparkles, Download } from "lucide-react";

interface UploadZoneProps {
  onFileSelect?: (files: FileList) => void;
}

export function UploadZone({ onFileSelect }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect?.(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect?.(files);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Upload Zone */}
      <Card>
        <CardContent className="p-6 md:p-12">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              rounded-lg border-2 border-dashed p-8 md:p-12 text-center transition-all
              ${
                isDragging
                  ? "border-accent bg-accent/10"
                  : "border-border bg-background hover:border-accent hover:bg-accent/5"
              }
            `}
          >
            <input
              type="file"
              id="file-upload"
              multiple
              accept=".pdf,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer block space-y-4"
            >
              <Upload className="mx-auto h-12 md:h-16 w-12 md:w-16 text-text-muted" />
              <div className="space-y-2">
                <h3 className="font-heading text-lg md:text-xl font-semibold text-primary">
                  Drop files here or click to upload
                </h3>
                <p className="text-sm md:text-base text-text-muted">
                  Supports PDF, DOCX, TXT formats • Max 50 files per upload
                </p>
              </div>
              <Button
                size="lg"
                className="bg-accent hover:bg-accent-hover mt-4"
                type="button"
              >
                <Upload className="mr-2 h-5 w-5" />
                Select Files
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Upload Instructions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-info/20 bg-gradient-to-br from-info/5 to-transparent">
          <CardContent className="pt-6 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-info/10">
              <FileText className="h-6 w-6 text-info" />
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-2">
                1. Prepare Files
              </h4>
              <p className="text-sm text-text-muted">
                Ensure all resumes are in PDF, DOCX, or TXT format
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-transparent">
          <CardContent className="pt-6 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
              <Sparkles className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-2">
                2. AI Processing
              </h4>
              <p className="text-sm text-text-muted">
                Our AI extracts skills, experience, and key information
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/20 bg-gradient-to-br from-success/5 to-transparent sm:col-span-2 lg:col-span-1">
          <CardContent className="pt-6 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <Download className="h-6 w-6 text-success" />
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-2">
                3. Review & Import
              </h4>
              <p className="text-sm text-text-muted">
                Review parsed data and import to your candidate pool
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Tips */}
      <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-transparent">
        <CardContent className="p-4 md:p-6">
          <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Pro Tips for Best Results
          </h4>
          <ul className="space-y-2 text-sm text-text-muted">
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span>Use high-quality, well-formatted resumes for better parsing accuracy</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span>Avoid scanned images - text-based PDFs work best</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span>Upload in batches of 10-20 resumes for faster processing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span>Review AI-extracted data and make corrections if needed</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
