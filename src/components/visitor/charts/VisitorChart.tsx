"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui/chart";
import { Loading } from "@/components/loading";

// Helper to format date to "23 June"
function formatDayMonth(dateStr: string) {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  return `${day} ${month}`;
}

// Helper to format date to "June"
function formatMonth(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", { month: "short" });
}

const chartConfig = {
  visitors: {
    label: "Visitors",
    color: "var(--primary)",
  },
};

interface VisitorChartProps {
  chartData: { date: string; visitors: number }[];
  isLoading: boolean;
  timeRange: string;
}

export default function VisitorChart({
  chartData,
  isLoading,
  timeRange,
}: VisitorChartProps) {
  // if (isLoading) {
  //   return (
  //     <div className="flex-1 flex justify-center items-center">
  //       <Loading />
  //     </div>
  //   );
  // }

  // XAxis tick formatter
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
      <LineChart data={chartData} margin={{ left: 20, right: 20 }}>
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
          content={<ChartTooltipContent hideLabel />}
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
