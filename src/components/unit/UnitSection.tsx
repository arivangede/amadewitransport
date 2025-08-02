"use client";

import api from "@/lib/axios";
import CreateUnitDialog from "./Dialog/CreateUnitDialog";
import { CarUnitCard } from "./UnitCard";
import { useQuery } from "@tanstack/react-query";
import { UnitWithRelations, useUnitStore } from "@/store/unitStore";
import { Loading } from "../loading";

export default function UnitSection() {
  const { data: units, isLoading } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const res = await api.get("/api/unit");
      return res.data;
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex w-full items-center justify-between p-4 rounded-md shadow border bg-background md:hover:border-foreground md:transition">
        <h3 className="font-bold text-xl">Unit List</h3>
        <CreateUnitDialog />
      </div>
      <div className="flex flex-col w-full gap-2 min-h-[300px] p-4 bg-muted/80 rounded-md">
        {isLoading ? (
          <div className="flex-1 flex justify-center items-center">
            <Loading />
          </div>
        ) : units.length > 0 ? (
          units.map((unit: UnitWithRelations) => (
            <CarUnitCard variant="admin" unit={unit} key={unit.id} />
          ))
        ) : (
          "There is no unit data found"
        )}
      </div>
    </div>
  );
}
