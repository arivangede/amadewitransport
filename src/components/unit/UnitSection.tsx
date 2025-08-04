"use client";

import api from "@/lib/axios";
import CreateUnitDialog from "./Dialog/CreateUnitDialog";
import { CarUnitCard } from "./UnitCard";
import { useQuery } from "@tanstack/react-query";
import { UnitWithRelations } from "@/store/unitStore";
import { Loading } from "../loading";

export default function UnitSection() {
  const {
    data: units,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const res = await api.get("/api/unit");
      return res.data;
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex w-full items-center justify-between p-4 rounded-md shadow bg-background">
        <h3 className="font-bold text-xl">Unit List</h3>
        <CreateUnitDialog />
      </div>
      <div className="flex flex-col w-full gap-2 min-h-[300px] max-h-[600px] overflow-y-auto p-2 bg-white/60 backdrop-blur-sm rounded-xl">
        {isLoading || isRefetching ? (
          <div className="flex-1 flex justify-center items-center">
            <Loading />
          </div>
        ) : units.length > 0 ? (
          units.map((unit: UnitWithRelations) => (
            <CarUnitCard variant="admin" unit={unit} key={unit.id} />
          ))
        ) : (
          <div className="flex-1 flex justify-center items-center">
            <span className="text-foreground/70 text-sm font-semibold">
              There is no unit data found
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
