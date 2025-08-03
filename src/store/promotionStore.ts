import {
  Discount,
  Package,
  PackageDiscount,
  Unit,
  UnitDiscount,
} from "@prisma/client";

export type PromotionWithRelations = Discount & {
  validity: { start_date: string; end_date: string };
  unit_discounts: (UnitDiscount & Unit)[] | null;
  package_discounts: (PackageDiscount & Package)[] | null;
};
