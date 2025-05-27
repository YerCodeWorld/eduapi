/*
  Warnings:

  - The values [FRENCH] on the enum `Language` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `teacherProfileEmail` on the `teacher_profile_sections` table. All the data in the column will be lost.
  - You are about to drop the column `userEmail` on the `teacher_profiles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `teacher_profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `teacherProfileId` to the `teacher_profile_sections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `teacher_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Language_new" AS ENUM ('SPANISH', 'ENGLISH');
ALTER TABLE "page_config" ALTER COLUMN "language" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "preferredLanguage" TYPE "Language_new" USING ("preferredLanguage"::text::"Language_new");
ALTER TABLE "page_config" ALTER COLUMN "language" TYPE "Language_new" USING ("language"::text::"Language_new");
ALTER TYPE "Language" RENAME TO "Language_old";
ALTER TYPE "Language_new" RENAME TO "Language";
DROP TYPE "Language_old";
ALTER TABLE "page_config" ALTER COLUMN "language" SET DEFAULT 'SPANISH';
COMMIT;

-- DropForeignKey
ALTER TABLE "teacher_profile_sections" DROP CONSTRAINT "teacher_profile_sections_teacherProfileEmail_fkey";

-- DropForeignKey
ALTER TABLE "teacher_profiles" DROP CONSTRAINT "teacher_profiles_userEmail_fkey";

-- DropIndex
DROP INDEX "teacher_profiles_userEmail_key";

-- AlterTable
ALTER TABLE "teacher_profile_sections" DROP COLUMN "teacherProfileEmail",
ADD COLUMN     "teacherProfileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "teacher_profiles" DROP COLUMN "userEmail",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "teacher_profiles_userId_key" ON "teacher_profiles"("userId");

-- AddForeignKey
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_profile_sections" ADD CONSTRAINT "teacher_profile_sections_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
