import { ChannelConnectionShell, InstagramVisual } from "@/components/ChannelConnectionShell";
import { requireUser } from "@/lib/auth";
import { MockAuthorizeClient } from "./MockAuthorizeClient";

type Props = {
  searchParams: Promise<{ state?: string }>;
};

export default async function MockProviderPage({ searchParams }: Props) {
  await requireUser();
  const params = await searchParams;

  return (
    <ChannelConnectionShell
      title="Mock OAuth"
      description="這個 provider 專門給本地與測試環境用，方便驗證 popup 授權流程。"
      backHref="/channels/connect/social"
      backLabel="返回社群連接"
      visual={<InstagramVisual />}
    >
      <MockAuthorizeClient state={params.state || ""} />
    </ChannelConnectionShell>
  );
}
