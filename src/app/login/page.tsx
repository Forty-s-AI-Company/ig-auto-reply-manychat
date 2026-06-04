import { LoginForm } from "@/components/LoginForm";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams?: Promise<{ google_error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const params = searchParams ? await searchParams : {};
  const initialError = params.google_error ? "Google 登入失敗，請再試一次或改用 Email 登入。" : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f6f7] px-4 text-[#111827]">
      <LoginForm initialError={initialError} />
    </main>
  );
}
