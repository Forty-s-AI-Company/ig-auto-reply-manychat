type AutomationScopeBannerProps = {
  badgeLabel: string;
  notice: string;
  selectedChannelName?: string | null;
  releaseNote?: string;
  testId?: string;
};

export function AutomationScopeBanner({
  badgeLabel,
  notice,
  selectedChannelName,
  releaseNote,
  testId,
}: AutomationScopeBannerProps) {
  return (
    <section
      className="mb-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-cyan-50 px-4 py-4 text-sm leading-6 text-[#5c3f00] shadow-sm"
      data-testid={testId}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">{badgeLabel}</span>
        {releaseNote ? <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#7a5a1a]">{releaseNote}</span> : null}
      </div>
      <p className="mt-2 font-medium text-[#4b3410]">{notice}</p>
      {selectedChannelName ? <p className="mt-2 text-xs text-[#7a5a1a]">目前左側選擇：{selectedChannelName}</p> : null}
      <p className="mt-1 text-xs text-[#7a5a1a]">切換 IG 帳號只會影響看板與對話篩選，不會把這裡的流程資料切成另一份。</p>
    </section>
  );
}
