/*
  Warnings:

  - You are about to drop the column `teacherProfileId` on the `teacher_profile_sections` table. All the data in the column will be lost.
  - Added the required column `teacherProfileEmail` to the `teacher_profile_sections` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "teacher_profile_sections" DROP CONSTRAINT "teacher_profile_sections_teacherProfileId_fkey";

-- AlterTable
ALTER TABLE "teacher_profile_sections" DROP COLUMN "teacherProfileId",
ADD COLUMN     "teacherProfileEmail" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "teacher_profile_sections" ADD CONSTRAINT "teacher_profile_sections_teacherProfileEmail_fkey" FOREIGN KEY ("teacherProfileEmail") REFERENCES "teacher_profiles"("userEmail") ON DELETE CASCADE ON UPDATE CASCADE;
