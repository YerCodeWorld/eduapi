-- CreateEnum
CREATE TYPE "DynamicType" AS ENUM ('READING', 'CONVERSATION', 'TEACHING_STRATEGY', 'GRAMMAR', 'VOCABULARY', 'GAME', 'COMPETITION', 'GENERAL');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('KIDS', 'TEENS', 'ADULTS', 'ALL_AGES');

-- CreateTable
CREATE TABLE "dynamics" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "materialsNeeded" TEXT,
    "duration" INTEGER NOT NULL,
    "minStudents" INTEGER NOT NULL DEFAULT 2,
    "maxStudents" INTEGER DEFAULT 40,
    "ageGroup" "AgeGroup" NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL DEFAULT 'INTERMEDIATE',
    "dynamicType" "DynamicType" NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorEmail" TEXT NOT NULL,

    CONSTRAINT "dynamics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dynamics_slug_key" ON "dynamics"("slug");

-- CreateIndex
CREATE INDEX "dynamics_authorEmail_idx" ON "dynamics"("authorEmail");

-- CreateIndex
CREATE INDEX "dynamics_published_idx" ON "dynamics"("published");

-- CreateIndex
CREATE INDEX "dynamics_featured_idx" ON "dynamics"("featured");

-- CreateIndex
CREATE INDEX "dynamics_dynamicType_idx" ON "dynamics"("dynamicType");

-- CreateIndex
CREATE INDEX "dynamics_ageGroup_idx" ON "dynamics"("ageGroup");

-- CreateIndex
CREATE INDEX "dynamics_difficulty_idx" ON "dynamics"("difficulty");

-- AddForeignKey
ALTER TABLE "dynamics" ADD CONSTRAINT "dynamics_authorEmail_fkey" FOREIGN KEY ("authorEmail") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;
