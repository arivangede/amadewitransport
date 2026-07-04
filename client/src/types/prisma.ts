// Prisma-generated types mirrored locally so the client
// doesn't need @prisma/client as a dependency.

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export interface Unit {
  id: number;
  name: string;
  year: number;
  capacity: number;
  inclusions: Record<string, unknown>[];
  base_rate: number;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UnitImage {
  id: number;
  path: string;
  unit_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Discount {
  id: number;
  name: string;
  description: string | null;
  discount_type: DISCOUNT_TYPE;
  discount_value: number;
  validity: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export enum DISCOUNT_TYPE {
  FIX_VALUE = "FIX_VALUE",
  PERCENTAGE = "PERCENTAGE",
}

export interface UnitDiscount {
  id: number;
  discount_id: number;
  unit_id: number;
  created_at: Date;
}

export interface Package {
  id: number;
  name: string;
  description: string | null;
  inclusions: Record<string, unknown>[];
  base_rate: number;
  created_at: Date;
  updated_at: Date;
}

export interface PackageImage {
  id: number;
  path: string;
  package_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface PackageDiscount {
  id: number;
  discount_id: number;
  package_id: number;
  created_at: Date;
}
