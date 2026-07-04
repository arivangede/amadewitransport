import { Discount, Unit, UnitDiscount, UnitImage } from "@prisma/client";
import { create } from "zustand";

export type UnitWithRelations = Unit & {
  images: UnitImage[] | null;
  discounts: (UnitDiscount & { discount: Discount })[] | null;
};

interface UnitStore {
  units: UnitWithRelations[];
  setUnits: (units: UnitWithRelations[]) => void;
}

export const useUnitStore = create<UnitStore>()((set) => ({
  units: [],
  setUnits: (units: UnitWithRelations[]) => set({ units }),
}));
