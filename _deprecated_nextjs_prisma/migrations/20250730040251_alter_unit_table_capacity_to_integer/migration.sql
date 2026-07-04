/*
  Warnings:

  - Changed the type of `capacity` on the `Unit` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Unit" DROP COLUMN "capacity",
ADD COLUMN     "capacity" INTEGER NOT NULL;
