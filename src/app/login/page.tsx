import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

async function loginAction(formData: FormData) {
  "use server";
  
  const password = formData.get("password") as string;
  const appPassword = process.env.APP_PASSWORD || "admin123";

  if (password === appPassword) {
    // Set secure HTTP-only cookie
    (await cookies()).set("auth_token", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    
    redirect("/");
  }

  // Return to login with error (handled by client)
  redirect("/login?error=invalid");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === "invalid";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary-light to-primary p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <Lock className="h-8 w-8 text-accent" />
          </div>
          <CardTitle className="font-heading text-3xl font-bold text-primary">
            Duti<span className="text-accent">ent</span> HRMS
          </CardTitle>
          <CardDescription className="text-base">
            Enter your password to access the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                className={hasError ? "border-danger" : ""}
                autoFocus
              />
              {hasError && (
                <p className="text-sm text-danger">
                  Invalid password. Please try again.
                </p>
              )}
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent-hover">
              Sign In
            </Button>
          </form>
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-center text-text-muted">
              Default password: <code className="bg-background px-2 py-1 rounded">admin123</code>
              <br />
              <span className="text-xs">Configure via APP_PASSWORD environment variable</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
