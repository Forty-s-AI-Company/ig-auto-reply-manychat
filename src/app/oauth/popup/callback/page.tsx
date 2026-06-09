import { CheckCircle2, CircleAlert } from "lucide-react";
import { ChannelConnectionShell, InstagramVisual } from "@/components/ChannelConnectionShell";
import { OAuthPopupBridge } from "@/components/oauth/OAuthPopupBridge";
import type { OAuthProviderId, PopupMessagePayload } from "@/lib/oauth/types";

type Props = {
  searchParams: Promise<{
    status?: string;
    provider?: string;
    accountId?: string;
    displayName?: string;
    message?: string;
  }>;
};

export default async function OAuthPopupCallbackPage({ searchParams }: Props) {
  const params = await searchParams;
  const payload: PopupMessagePayload = {
    status: params.status === "error" ? "error" : "success",
    provider: (params.provider || "mock") as OAuthProviderId,
    accountId: params.accountId,
    displayName: params.displayName,
    message: params.message,
  };

  const title = payload.status === "success" ? "帳號連接完成" : "帳號連接失敗";
  const description =
    payload.status === "success"
      ? `${payload.displayName || "社群帳號"} 已完成授權，資料會回傳到主視窗。`
      : payload.message || "OAuth 視窗沒有完成授權，請回到原視窗重新嘗試。";

  return (
    <ChannelConnectionShell
      title={title}
      description={description}
      backHref="/channels/connect/social"
      backLabel="返回社群連接"
      visual={<InstagramVisual />}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-[#d7dbe0] bg-white p-5">
          {payload.status === "success" ? (
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          ) : (
            <CircleAlert className="h-8 w-8 text-[#d92d20]" />
          )}
          <div>
            <h2 className="text-lg font-semibold text-[#17191c]">{title}</h2>
            <p className="mt-1 text-sm text-[#596170]">{description}</p>
          </div>
        </div>
        <OAuthPopupBridge payload={payload} />
      </div>
    </ChannelConnectionShell>
  );
}
