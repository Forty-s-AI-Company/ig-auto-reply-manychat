import { headers } from "next/headers";
import { ChannelConnectionShell, InstagramVisual } from "@/components/ChannelConnectionShell";
import { requireUser } from "@/lib/auth";
import { InstagramConnectOptions } from "../instagram/InstagramConnectOptions";

type Props = {
  searchParams?: Promise<{ meta_error?: string }>;
};

export default async function MessengerConnectionPage({ searchParams }: Props) {
  await requireUser();
  const params = searchParams ? await searchParams : {};
  const headerStore = await headers();
  const host = headerStore.get("host") || "localhost:3041";
  const proto = headerStore.get("x-forwarded-proto") || (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  const origin = `${proto}://${host}`;
  const configuredAppUrl = process.env.APP_URL?.replace(/\/$/, "") || "";

  return (
    <ChannelConnectionShell
      title="Connect Facebook Messenger"
      description="Use your Facebook Page to connect Messenger automation."
      backHref="/channels/connect"
      backLabel="Choose another channel"
      visual={<InstagramVisual />}
    >
      <InstagramConnectOptions
        metaError={params.meta_error}
        callbackUrl={`${origin}/api/meta/oauth/callback`}
        configuredAppUrl={configuredAppUrl}
        loginPreference="facebook"
      />
    </ChannelConnectionShell>
  );
}
