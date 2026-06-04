import { LoginForm } from "@/components/LoginForm";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams?: Promise<{ google_error?: string }>;
};

function formatGoogleLoginError(raw?: string) {
  if (!raw) return "";

  const normalized = raw.trim();
  if (!normalized) return "";

  const knownErrors: Record<string, string> = {
    invalid_state: "Google 登入失敗，狀態驗證無效。",
    email_not_verified: "Google 登入失敗，這個 Google 帳號的 Email 尚未驗證。",
    google_login_failed: "Google 登入失敗，請再試一次或改用 Email 登入。",
  };

  const message = knownErrors[normalized] || "Google 登入失敗，請再試一次或改用 Email 登入。";
  const detail = normalized.slice(0, 160);

  return `${message}（代碼：${detail}）`;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const params = searchParams ? await searchParams : {};
  const initialError = formatGoogleLoginError(params.google_error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f6f7] px-4 text-[#111827]">
      <LoginForm initialError={initialError} />
    </main>
  );
}
