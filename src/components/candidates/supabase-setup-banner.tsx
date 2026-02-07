"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ExternalLink } from "lucide-react";

export function SupabaseSetupBanner() {
  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-warning flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-primary mb-1">
              Supabase Not Configured
            </h3>
            <p className="text-sm text-text-muted mb-3">
              To see real candidate data, you need to configure your Supabase credentials. Follow these steps:
            </p>
            <ol className="text-sm text-text-muted space-y-1 mb-4 list-decimal list-inside">
              <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">supabase.com</a></li>
              <li>Run the provided SQL schema in your Supabase SQL Editor</li>
              <li>Update <code className="bg-primary/5 px-1.5 py-0.5 rounded text-xs">.env.local</code> with your project URL and anon key</li>
              <li>Restart your dev server</li>
            </ol>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open("https://supabase.com", "_blank")}
                className="border-warning/30 hover:bg-warning/10"
              >
                <ExternalLink className="mr-2 h-3 w-3" />
                Go to Supabase
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open("https://github.com/supabase/supabase", "_blank")}
                className="border-warning/30 hover:bg-warning/10"
              >
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
