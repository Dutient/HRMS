"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Logout action - clears auth cookie and redirects to login
 */
export async function logout() {
  // Delete the auth token cookie
  (await cookies()).delete("auth_token");
  
  // Redirect to login page
  redirect("/login");
}
