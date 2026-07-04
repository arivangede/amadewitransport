import {
  Discount,
  Package,
  PackageDiscount,
  PackageImage,
} from "@/types/prisma";

export type PackageWithRelations = Package & {
  images: PackageImage[] | null;
  discounts: (PackageDiscount & { discount: Discount })[] | null;
};
