"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { DashboardStats } from "@/types/domain";
export default function KnowledgeChart({ stats }: { stats?: DashboardStats }) {
  const data = [
    { name: "Captured", value: stats?.total_captured || 0 },
    { name: "Published", value: stats?.total_published || 0 },
    { name: "Review", value: stats?.pending_approval || 0 },
  ];
  return (
    <div
      className="my-5 h-60"
      role="img"
      aria-label={`Knowledge totals: ${data.map((item) => `${item.name} ${item.value}`).join(", ")}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -25, right: 10 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: "rgb(var(--text-muted))", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "rgb(var(--text-muted))", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "rgb(var(--surface))",
              border: "1px solid rgb(var(--border))",
              borderRadius: 12,
              color: "rgb(var(--text-primary))",
            }}
            cursor={{ fill: "rgb(var(--surface-elevated))" }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={44}>
            {data.map((item, index) => (
              <Cell key={item.name} fill={["rgb(var(--accent))", "#2FBF8F", "#E0A93E"][index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
