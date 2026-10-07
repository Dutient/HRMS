import { ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";

export default async function AccessPendingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <Card className="w-full max-w-md border-slate-200 shadow-sm">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
            <ShieldAlert className="h-6 w-6 text-amber-500" />
          </div>
          <h1 className="text-[22px] font-heading font-bold text-slate-900">Access pending</h1>
          <p className="mt-2 text-sm text-slate-500">
            {user?.email ? (
              <>
                You&apos;re signed in as <span className="font-medium text-slate-700">{user.email}</span>, but
                this account hasn&apos;t been approved for HireStack yet.
              </>
            ) : (
              <>This account hasn&apos;t been approved for HireStack yet.</>
            )}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Ask Krishna Srivastava or Khushi Gupta to approve your access.
          </p>
          <form action={logout} className="mt-6 w-full">
            <Button type="submit" variant="outline" className="w-full">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
