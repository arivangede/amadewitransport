import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { PackageWithRelations } from "@/store/packageStore";
import type { UnitWithRelations } from "@/store/unitStore";

export function useUnits() {
  return useQuery({
    queryKey: ["units"],
    queryFn: async () => (await api.get("/api/unit")).data as UnitWithRelations[],
  });
}

export function usePackages() {
  return useQuery({
    queryKey: ["packages"],
    queryFn: async () => (await api.get("/api/package")).data as PackageWithRelations[],
  });
}
