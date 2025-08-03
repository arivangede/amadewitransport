import {
  Discount,
  Package,
  PackageDiscount,
  PackageImage,
} from "@prisma/client";

export type PackageWithRelations = Package & {
  images: PackageImage[] | null;
  discounts: (PackageDiscount & Discount)[] | null;
};
