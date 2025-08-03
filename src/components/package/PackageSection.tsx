"use client";

import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Loading } from "../loading";
import { PackageWithRelations } from "@/store/packageStore";
import { PackageCard } from "./PackageCard";
import PackageDialog from "./Dialog/PackageDialog";

export default function PackageSection() {
  const {
    data: packages,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await api.get("/api/package");
      return res.data;
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex w-full items-center justify-between p-4 rounded-md shadow bg-background">
        <h3 className="font-bold text-xl">Package List</h3>
        <PackageDialog variant="create" />
      </div>
      <div className="flex flex-col w-full gap-2 min-h-[300px] p-2 bg-white/60 backdrop-blur-sm rounded-xl">
        {isLoading || isRefetching ? (
          <div className="flex-1 flex justify-center items-center">
            <Loading />
          </div>
        ) : packages.length > 0 ? (
          packages.map((item: PackageWithRelations) => (
            <PackageCard variant="admin" key={item.id} package={item} />
          ))
        ) : (
          <div className="flex-1 flex justify-center items-center">
            <span className="text-foreground/70 text-sm font-semibold">
              There is no package data found
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
