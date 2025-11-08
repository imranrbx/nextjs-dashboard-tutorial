-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('SIMPLE', 'VARIABLE');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "productType" "ProductType" NOT NULL DEFAULT 'SIMPLE';
