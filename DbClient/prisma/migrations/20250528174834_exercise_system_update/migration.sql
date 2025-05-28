-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('FILL_BLANK', 'MATCHING', 'MULTIPLE_CHOICE', 'ORDERING');

-- CreateEnum
CREATE TYPE "ExerciseDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "ExerciseCategory" AS ENUM ('GRAMMAR', 'VOCABULARY', 'READING', 'WRITING', 'LISTENING', 'SPEAKING', 'CONVERSATION', 'GENERAL');

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT,
    "type" "ExerciseType" NOT NULL,
    "difficulty" "ExerciseDifficulty" NOT NULL DEFAULT 'INTERMEDIATE',
    "category" "ExerciseCategory" NOT NULL DEFAULT 'GENERAL',
    "content" JSONB NOT NULL,
    "hints" TEXT[],
    "explanation" TEXT,
    "tags" TEXT[],
    "timesCompleted" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorEmail" TEXT NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exercises_authorEmail_idx" ON "exercises"("authorEmail");

-- CreateIndex
CREATE INDEX "exercises_type_idx" ON "exercises"("type");

-- CreateIndex
CREATE INDEX "exercises_difficulty_idx" ON "exercises"("difficulty");

-- CreateIndex
CREATE INDEX "exercises_category_idx" ON "exercises"("category");

-- CreateIndex
CREATE INDEX "exercises_isPublished_idx" ON "exercises"("isPublished");

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_authorEmail_fkey" FOREIGN KEY ("authorEmail") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;
