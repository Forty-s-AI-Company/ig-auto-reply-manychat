import { redirect } from "next/navigation";
import { SignupForm } from "@/components/SignupForm";
import { getCurrentUser } from "@/lib/auth";

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f6f7] px-4 text-[#111827]">
      <SignupForm />
    </main>
  );
}
