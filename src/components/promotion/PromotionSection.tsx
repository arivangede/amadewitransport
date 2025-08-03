"use client";

import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Loading } from "../loading";
import PromotionDialog from "./dialog/PromotionDialog";
import { PromotionCard } from "./PromotionCard";
import { PromotionWithRelations } from "@/store/promotionStore";

export default function PromotionSection() {
  const {
    data: promotions,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: ["promotions"],
    queryFn: async () => {
      const res = await api.get("/api/promotion");
      return res.data;
    },
  });
  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex w-full items-center justify-between p-4 rounded-md shadow border bg-background">
        <h3 className="font-bold text-xl">Promotion List</h3>
        <PromotionDialog variant="create" />
      </div>
      <div className="flex flex-col w-full gap-2 min-h-[300px] p-4 bg-muted/80 rounded-md">
        {isLoading || isRefetching ? (
          <div className="flex-1 flex justify-center items-center">
            <Loading />
          </div>
        ) : promotions.length > 0 ? (
          promotions.map((prom: PromotionWithRelations) => (
            <PromotionCard promotion={prom} key={prom.id} />
          ))
        ) : (
          <div className="flex-1 flex justify-center items-center">
            <span className="text-foreground/70 text-sm font-semibold">
              There is no promotion data found
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
