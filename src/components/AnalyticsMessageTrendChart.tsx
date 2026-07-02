"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AnalyticsMessageTrendPoint } from "@/lib/analytics-state";

type AnalyticsMessageTrendChartProps = {
  data: AnalyticsMessageTrendPoint[];
  total: number;
  scopeDetail: string;
};

export function AnalyticsMessageTrendChart({ data, total, scopeDetail }: AnalyticsMessageTrendChartProps) {
  const hasMessages = data.some((point) => point.messages > 0);
  const summary = data.map((point) => `${point.label} ${point.messages} 則`).join("，");

  return (
    <figure className="space-y-4" aria-label="近 7 天訊息折線圖" data-testid="analytics-message-trend-chart">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1 text-sm leading-6 text-[var(--text-secondary)]">
          <p className="font-semibold text-[var(--text-primary)]">近 7 天共有 {total} 則訊息</p>
          <p>{scopeDetail}</p>
        </div>
        <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-[var(--teal-dark)]">
          每日趨勢
        </span>
      </div>

      <div className="h-64 rounded-xl border border-[var(--border-soft)] bg-white px-2 py-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 18, bottom: 0, left: -10 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              width={34}
            />
            <Tooltip
              cursor={{ stroke: "#19D3D8", strokeWidth: 1 }}
              contentStyle={{
                border: "1px solid #d7dbe0",
                borderRadius: 10,
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                color: "#0f172a",
              }}
              formatter={(value) => [`${value} 則`, "訊息"]}
              labelFormatter={(label) => `${label}`}
            />
            <Line
              type="monotone"
              dataKey="messages"
              stroke="#0D5C63"
              strokeWidth={3}
              dot={{ r: 3, strokeWidth: 2, fill: "#ffffff", stroke: "#0D5C63" }}
              activeDot={{ r: 5, fill: "#19D3D8", stroke: "#0D5C63", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <figcaption className="text-xs leading-5 text-[var(--text-muted)]">
        {hasMessages ? `每日訊息量：${summary}` : "目前近 7 天還沒有訊息，圖表會在收到新對話後自動累積。"}
      </figcaption>
    </figure>
  );
}
