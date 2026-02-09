"use server";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export interface EmailTemplate {
  id: string;
  name: string;
  type: "rejection" | "offer" | "invite";
  subject: string;
  body: string;
  last_updated: string;
  created_at: string;
}

/**
 * Get all email templates
 */
export async function getTemplates(): Promise<EmailTemplate[]> {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching templates:", error);
      return [];
    }

    return (data || []) as EmailTemplate[];
  } catch (error) {
    console.error("Fatal error fetching templates:", error);
    return [];
  }
}

/**
 * Update an email template
 */
export async function updateTemplate(
  id: string,
  subject: string,
  body: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    console.log("📧 Updating template...", { id, subject: subject.substring(0, 50) });

    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        message: "Database connection not configured",
      };
    }

    // Validate required fields
    if (!id || !subject || !body) {
      return {
        success: false,
        message: "Missing required fields",
      };
    }

    // Update template
    const { error: updateError } = await supabase
      .from("email_templates")
      .update({
        subject,
        body,
      })
      .eq("id", id);

    if (updateError) {
      console.error("❌ Error updating template:", updateError);
      return {
        success: false,
        message: `Failed to update template: ${updateError.message}`,
      };
    }

    console.log("✅ Template updated successfully");

    // Revalidate the templates page
    revalidatePath("/templates");

    return {
      success: true,
      message: "Template updated successfully",
    };
  } catch (error) {
    console.error("❌ Fatal error updating template:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
