"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui/chart";

// Helper to format date to "23 June"
function formatDayMonth(dateStr: string) {
  const date = new Date(dateStr);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const day = new Date(date.toLocaleString("en-US", { timeZone })).getDate();
  const month = date.toLocaleString("en-US", { month: "short", timeZone });
  return `${day} ${month}`;
}

// Helper to format date to "June"
function formatMonth(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", { month: "short", timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone });
}

const chartConfig = {
  visitors: {
    label: "Visitors",
    color: "var(--primary)",
  },
};

interface VisitorChartProps {
  chartData: { date: string; visitors: number }[];
  timeRange: string;
}

export default function VisitorChart({
  chartData,
  timeRange,
}: VisitorChartProps) {
  const tickFormatter = (value: string) => {
    if (timeRange === "7days" || timeRange === "30days") {
      return formatDayMonth(value);
    } else if (timeRange === "3month" || timeRange === "1year") {
      return formatMonth(value);
    }
    return value;
  };

  return (
    <ChartContainer config={chartConfig} className="max-h-[300px] w-full">
      <LineChart data={chartData} margin={{ left: 20, right: 20, top: 40 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={tickFormatter}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              label={"date"}
              labelFormatter={(value) => {
                if (timeRange === "7days" || timeRange === "30days") {
                  return formatDayMonth(value);
                } else if (timeRange === "3month" || timeRange === "1year") {
                  return formatMonth(value);
                }
                return value;
              }}
            />
          }
        />
        <Line
          dataKey="visitors"
          type="natural"
          stroke="var(--primary)"
          strokeWidth={2}
          dot={{
            fill: "var(--primary)",
          }}
          activeDot={{
            r: 6,
          }}
        />
      </LineChart>
    </ChartContainer>
  );
}
