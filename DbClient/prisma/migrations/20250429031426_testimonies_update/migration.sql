/*
  Warnings:

  - You are about to drop the column `userId` on the `testimonies` table. All the data in the column will be lost.
  - Added the required column `userEmail` to the `testimonies` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "testimonies" DROP CONSTRAINT "testimonies_userId_fkey";

-- AlterTable
ALTER TABLE "testimonies" DROP COLUMN "userId",
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rating" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "userEmail" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "testimonies" ADD CONSTRAINT "testimonies_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;
