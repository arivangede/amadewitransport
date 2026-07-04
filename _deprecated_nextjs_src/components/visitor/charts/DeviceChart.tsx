import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

interface DeviceChartProps {
  deviceData: {
    device: string;
    value: number;
  }[];
}

const chartConfig = {
  value: {
    label: "Visitors",
  },
  desktop: {
    label: "desktop",
    color: "var(--chart-1)",
  },
  tablet: {
    label: "tablet",
    color: "var(--chart-2)",
  },
  mobile: {
    label: "mobile",
    color: "var(--chart-3)",
  },
  unknown: {
    label: "unknown",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export default function DeviceChart({
  deviceData,
}: DeviceChartProps) {
  const formattedChartData = deviceData.map((d) => ({
    ...d,
    fill: "var(--primary)",
  }));
  return (
    <ChartContainer config={chartConfig} className="max-h-[100px] w-full">
      <BarChart accessibilityLayer data={formattedChartData} layout="vertical">
        <YAxis
          dataKey={"device"}
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) =>
            chartConfig[value as keyof typeof chartConfig].label
          }
        />
        <XAxis dataKey={"value"} type="number" hide />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="value" layout="vertical" radius={5} />
      </BarChart>
    </ChartContainer>
  );
}
