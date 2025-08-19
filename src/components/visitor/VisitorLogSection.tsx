"use client";
import { useQuery } from "@tanstack/react-query";
import VisitorChart from "./charts/VisitorChart";
import { getVisitorFn } from "./service/api";
import { useEffect, useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import DeviceChart from "./charts/DeviceChart";
import { Badge } from "../ui/badge";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

const timeRanges = ["7 days", "30 days", "1 year"];

export default function VisitorLogSection() {
  const [timeRange, setTimeRange] = useState<
    "7days" | "30days" | "1year" | string
  >("7days");
  const [chartVisitor, setChartVisitor] = useState<
    { date: string; visitors: number }[]
  >([]);
  const [deviceData, setDeviceData] = useState<
    { device: string; value: number }[]
  >([]);
  const [locations, setLocations] = useState<
    { region: string; value: number }[]
  >([]);

  const { data, isFetching: isLoading } = useQuery({
    queryKey: ["charts", timeRange],
    queryFn: () => getVisitorFn(timeRange),
  });

  useEffect(() => {
    if (!isLoading) {
      setChartVisitor(data?.graph || []);
      setDeviceData(data?.summary.device || []);
      setLocations(data?.summary.region || []);
    }
  }, [data, isLoading]);

  console.log(timeRange);
  return (
    <Card className="bg-white/30 backdrop-blur-sm border-white border-2">
      <CardHeader>
        <CardTitle className="text-2xl">Visitor Tracker</CardTitle>
        <CardDescription>
          Monitor your visitor within selected time range
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant={"outline"}
            className="hidden md:inline"
          >
            {timeRanges.map((item, index) => (
              <ToggleGroupItem key={index} value={item.replace(/\s/g, "")}>
                Last {item}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="md:hidden">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((item, index) => (
                <SelectItem key={index} value={item.replace(/\s/g, "")}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-transparent border border-5 border-white">
            <CardHeader>
              <CardTitle>Traffic</CardTitle>
              <CardDescription className="flex items-center gap-4">
                <span>Number of visitors over time</span>|
                <span>
                  Total showed: {data?.summary.total} visitors in last{" "}
                  {timeRange} & {data?.summary.returningVisitorPercentage}% of
                  returning visitor
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VisitorChart
                chartData={chartVisitor}
                timeRange={timeRange}
              />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 grid-rows-2 gap-4">
            <Card className="bg-transparent border border-5 border-white">
              <CardHeader>
                <CardTitle>Device Types</CardTitle>
                <CardDescription>
                  Breakdown of devices used by visitors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DeviceChart deviceData={deviceData}/>
              </CardContent>
            </Card>
            <Card className="bg-transparent border border-5 border-white">
              <CardHeader>
                <CardTitle>Locations</CardTitle>
                <CardDescription>
                  Summary of visitor locations based on IP address
                </CardDescription>
                <CardContent className="flex flex-row flex-wrap gap-4 overflow-y-auto">
                  {locations.map((item, index) => (
                    <Badge key={index}>
                      {item.region} : {item.value}
                    </Badge>
                  ))}
                </CardContent>
              </CardHeader>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
