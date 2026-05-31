import { ExternalLink, LogIn, RefreshCw } from "lucide-react";
import { ChannelConnectionShell, InstagramVisual } from "@/components/ChannelConnectionShell";
import { requireUser } from "@/lib/auth";
import { OAuthPopupButton } from "../OAuthPopupButton";

export default async function InstagramSwitchAccountPage() {
  await requireUser();

  return (
    <ChannelConnectionShell
      title="新增其他 Instagram 帳號"
      description="如果授權視窗一直顯示原本帳號，先切換 Instagram 網頁版登入狀態，再回來繼續授權。"
      backHref="/channels/connect/instagram"
      backLabel="返回 Instagram 連接"
      visual={<InstagramVisual />}
    >
      <div>
        <h2 className="text-lg font-bold text-[#17191c]">切換帳號後再授權</h2>
        <p className="mt-3 max-w-[430px] text-base leading-7 text-[#17191c]">
          Instagram 會沿用目前瀏覽器登入中的帳號。要新增第二個帳號時，請先確認 Instagram 網頁版已切換到你要新增的帳號。
        </p>

        <div className="mt-6 grid gap-3">
          <a
            href="https://www.instagram.com/accounts/login/"
            target="_blank"
            rel="noreferrer"
            className="flex min-h-14 items-center justify-between rounded-md border border-[#dcecef] bg-white px-4 text-left text-sm font-bold text-[#17191c] hover:bg-[#f8fcfd]"
          >
            <span className="inline-flex items-center gap-3">
              <LogIn className="h-5 w-5 text-[var(--teal-dark)]" />
              開啟 Instagram 網頁版切換帳號
            </span>
            <ExternalLink className="h-4 w-4 text-[#94a3b8]" />
          </a>

          <OAuthPopupButton href="/api/meta/oauth/start?mode=instagram&switch_account=1">
            我已切換，繼續授權
          </OAuthPopupButton>

          <a
            href="/api/meta/oauth/start?mode=instagram"
            className="flex h-11 items-center justify-center gap-2 rounded-md border border-[#d2d6dc] bg-white px-4 text-sm font-bold text-[#17191c] hover:bg-[#f6f7f9]"
          >
            <RefreshCw className="h-4 w-4" />
            沿用目前帳號授權
          </a>
        </div>

        <div className="mt-6 rounded-md border border-[#dcecef] bg-[#f8fcfd] p-4">
          <p className="text-sm font-semibold text-[#17191c]">手機提示</p>
          <p className="mt-2 text-xs leading-5 text-[#667085]">
            如果 Instagram App 自動跳出，請回到瀏覽器確認 Instagram 網頁版帳號。無痕模式也可以作為新增不同帳號的乾淨環境。
          </p>
        </div>
      </div>
    </ChannelConnectionShell>
  );
}
