import api from "@/lib/axios";

export async function getVisitorFn(timeRange: string): Promise<{
  graph: { date: string; visitors: number }[];
  summary: {
    total: number;
    device: { device: string; value: number }[];
    region: { region: string; value: number }[];
    returningVisitorPercentage: number;
  };
}> {
  const res = await api.get(`/api/track-visitor?range=${timeRange}`);
  console.log(res.data);
  return res.data;
}
