"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Save,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { getTemplates, updateTemplate, type EmailTemplate } from "@/app/actions/templates";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Load templates on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await getTemplates();
        setTemplates(data);
        if (data.length > 0 && !selectedTemplate) {
          const firstTemplate = data[0];
          setSelectedTemplate(firstTemplate);
          setSubject(firstTemplate.subject);
          setBody(firstTemplate.body);
        }
      } catch (error) {
        console.error("Error loading templates:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setSubject(template.subject);
    setBody(template.body);
    setSaveStatus("idle");
    setErrorMessage("");
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    setIsSaving(true);
    setSaveStatus("idle");
    setErrorMessage("");

    try {
      const result = await updateTemplate(selectedTemplate.id, subject, body);
      
      if (result.success) {
        setSaveStatus("success");
        // Reload templates to get updated data
        const data = await getTemplates();
        setTemplates(data);
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
        setErrorMessage(result.message);
      }
    } catch (error) {
      setSaveStatus("error");
      setErrorMessage("Failed to save template");
      console.error("Error saving template:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getTemplateIcon = (type: string) => {
    const iconClass = "h-4 w-4";
    switch (type) {
      case "invite":
        return <Mail className={iconClass} />;
      case "offer":
        return <CheckCircle2 className={iconClass} />;
      case "rejection":
        return <AlertCircle className={iconClass} />;
      default:
        return <FileText className={iconClass} />;
    }
  };

  const getTemplateColor = (type: string) => {
    switch (type) {
      case "invite":
        return "bg-info/10 text-info border-info/20";
      case "offer":
        return "bg-success/10 text-success border-success/20";
      case "rejection":
        return "bg-danger/10 text-danger border-danger/20";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-col md:flex-row gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold text-primary">
            Email Templates
          </h1>
          <p className="mt-2 text-text-muted">
            Customize email templates for interviews, offers, and rejections
          </p>
        </div>
        <Badge variant="secondary" className="text-base px-4 py-2">
          <Mail className="mr-2 h-4 w-4" />
          {templates.length} Template{templates.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Main Layout: Sidebar + Editor */}
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Left Sidebar - Template List */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Templates</CardTitle>
            <CardDescription>
              Select a template to edit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {templates.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-text-muted mb-3" />
                <p className="text-text-muted text-sm">No templates found</p>
              </div>
            ) : (
              templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => selectTemplate(template)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedTemplate?.id === template.id
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getTemplateIcon(template.type)}
                    <span className="font-semibold text-primary">
                      {template.name}
                    </span>
                  </div>
                  <Badge className={getTemplateColor(template.type)}>
                    {template.type}
                  </Badge>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Right Side - Template Editor */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-heading text-2xl flex items-center gap-2">
                  {selectedTemplate ? (
                    <>
                      {getTemplateIcon(selectedTemplate.type)}
                      {selectedTemplate.name}
                    </>
                  ) : (
                    "Select a Template"
                  )}
                </CardTitle>
                <CardDescription>
                  {selectedTemplate
                    ? `Last updated: ${new Date(selectedTemplate.last_updated).toLocaleDateString()}`
                    : "Choose a template from the list to start editing"}
                </CardDescription>
              </div>
              {selectedTemplate && (
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-accent hover:bg-accent-hover"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>

          {selectedTemplate ? (
            <CardContent className="space-y-6">
              {/* Save Status */}
              {saveStatus === "success" && (
                <div className="rounded-md bg-success/10 border border-success/20 p-3 text-sm text-success flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Template saved successfully!
                </div>
              )}
              {saveStatus === "error" && (
                <div className="rounded-md bg-danger/10 border border-danger/20 p-3 text-sm text-danger flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errorMessage || "Failed to save template"}
                </div>
              )}

              {/* Subject Field */}
              <div className="space-y-2">
                <Label htmlFor="subject">
                  Email Subject <span className="text-danger">*</span>
                </Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="font-medium"
                />
              </div>

              <Separator />

              {/* Body Field */}
              <div className="space-y-2">
                <Label htmlFor="body">
                  Email Body <span className="text-danger">*</span>
                </Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Enter email body..."
                  rows={16}
                  className="font-mono text-sm resize-none"
                />
              </div>

              {/* Variables Hint */}
              <div className="rounded-lg bg-accent/5 border border-accent/20 p-4">
                <p className="text-sm font-semibold text-primary mb-2">
                  Available Variables:
                </p>
                <div className="flex flex-wrap gap-2">
                  {["{{name}}", "{{role}}", "{{date}}", "{{time}}", "{{location}}", "{{salary}}"].map((variable) => (
                    <Badge key={variable} variant="secondary" className="font-mono">
                      {variable}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-text-muted mt-3">
                  These variables will be automatically replaced with actual values when sending emails.
                </p>
              </div>
            </CardContent>
          ) : (
            <CardContent>
              <div className="text-center py-12">
                <Mail className="mx-auto h-16 w-16 text-text-muted mb-4" />
                <h3 className="font-heading text-xl font-semibold text-primary mb-2">
                  No Template Selected
                </h3>
                <p className="text-text-muted">
                  Select a template from the list to view and edit its content
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
