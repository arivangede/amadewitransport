/*
  Warnings:

  - Made the column `validity` on table `Discount` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Discount" ALTER COLUMN "validity" SET NOT NULL;
