import { ChannelConnectionShell, InstagramVisual } from "@/components/ChannelConnectionShell";
import { TokenProviderForm } from "@/components/oauth/TokenProviderForm";
import { requireUser } from "@/lib/auth";

export default async function TelegramProviderPage() {
  await requireUser();

  return (
    <ChannelConnectionShell
      title="連接 Telegram Bot"
      description="這個視窗會驗證你的 Bot Token，成功後把連接結果回傳給主視窗。"
      backHref="/channels/connect/social"
      backLabel="返回社群連接"
      visual={<InstagramVisual />}
    >
      <TokenProviderForm
        provider="telegram-bot"
        title="Telegram Bot Token"
        description="請貼上 @BotFather 提供的 Bot Token。系統會先呼叫 Telegram getMe 驗證，再安全地加密存入資料庫。"
      />
    </ChannelConnectionShell>
  );
}
