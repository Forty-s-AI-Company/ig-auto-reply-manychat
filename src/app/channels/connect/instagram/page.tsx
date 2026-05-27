import { headers } from "next/headers";
import { ChannelConnectionShell, InstagramVisual } from "@/components/ChannelConnectionShell";
import { requireUser } from "@/lib/auth";
import { InstagramConnectOptions } from "./InstagramConnectOptions";

type Props = {
  searchParams?: Promise<{ meta_error?: string }>;
};

export default async function InstagramConnectionPage({ searchParams }: Props) {
  await requireUser();
  const params = searchParams ? await searchParams : {};
  const headerStore = await headers();
  const host = headerStore.get("host") || "localhost:3041";
  const proto = headerStore.get("x-forwarded-proto") || (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  const origin = `${proto}://${host}`;
  const configuredAppUrl = process.env.APP_URL?.replace(/\/$/, "") || "";
  const callbackUrl = `${origin}/api/meta/oauth/callback`;

  return (
    <ChannelConnectionShell
      title="連接 Instagram"
      description="使用你的 Instagram 帳號連接到自動回覆平台。"
      backHref="/channels/connect"
      backLabel="選擇其他平台"
      visual={<InstagramVisual />}
    >
      <InstagramConnectOptions
        metaError={params.meta_error}
        callbackUrl={callbackUrl}
        configuredAppUrl={configuredAppUrl}
      />
    </ChannelConnectionShell>
  );
}
