import { redirect } from "next/navigation";

// Accounts are created by signing in with Google; there is no separate registration.
export default function RegisterPage() {
  redirect("/login");
}
