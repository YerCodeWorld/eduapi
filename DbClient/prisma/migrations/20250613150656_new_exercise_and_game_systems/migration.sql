-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('WORD_SEARCH', 'CATCH_CORRECT_WORD', 'MEMORY_QUIZ', 'WORD_CRUSH', 'PUZZLE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ExerciseDifficulty" ADD VALUE 'UPPER_BEGINNER';
ALTER TYPE "ExerciseDifficulty" ADD VALUE 'UPPER_INTERMIDIATE';
ALTER TYPE "ExerciseDifficulty" ADD VALUE 'SUPER_ADVANCED';

-- AlterTable
ALTER TABLE "exercises" ADD COLUMN     "packageId" TEXT;

-- CreateTable
CREATE TABLE "exercise_packages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "category" "ExerciseCategory" NOT NULL DEFAULT 'GENERAL',
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "maxExercises" INTEGER NOT NULL DEFAULT 30,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_package_completions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "completedExercises" TEXT[],
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_package_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "gameType" "GameType" NOT NULL,
    "config" JSONB NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_levels" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "levelNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "unlockAfter" INTEGER NOT NULL DEFAULT 0,
    "maxPoints" INTEGER NOT NULL DEFAULT 100,
    "timeLimit" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_game_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "levelId" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "timeElapsed" INTEGER,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "progress" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "user_game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exercise_packages_slug_key" ON "exercise_packages"("slug");

-- CreateIndex
CREATE INDEX "exercise_packages_category_idx" ON "exercise_packages"("category");

-- CreateIndex
CREATE INDEX "exercise_packages_isPublished_idx" ON "exercise_packages"("isPublished");

-- CreateIndex
CREATE INDEX "exercise_packages_featured_idx" ON "exercise_packages"("featured");

-- CreateIndex
CREATE INDEX "exercise_packages_slug_idx" ON "exercise_packages"("slug");

-- CreateIndex
CREATE INDEX "user_package_completions_userId_idx" ON "user_package_completions"("userId");

-- CreateIndex
CREATE INDEX "user_package_completions_packageId_idx" ON "user_package_completions"("packageId");

-- CreateIndex
CREATE UNIQUE INDEX "user_package_completions_userId_packageId_key" ON "user_package_completions"("userId", "packageId");

-- CreateIndex
CREATE UNIQUE INDEX "games_slug_key" ON "games"("slug");

-- CreateIndex
CREATE INDEX "games_gameType_idx" ON "games"("gameType");

-- CreateIndex
CREATE INDEX "games_isPublished_idx" ON "games"("isPublished");

-- CreateIndex
CREATE INDEX "games_featured_idx" ON "games"("featured");

-- CreateIndex
CREATE INDEX "games_slug_idx" ON "games"("slug");

-- CreateIndex
CREATE INDEX "game_levels_gameId_idx" ON "game_levels"("gameId");

-- CreateIndex
CREATE INDEX "game_levels_levelNumber_idx" ON "game_levels"("levelNumber");

-- CreateIndex
CREATE UNIQUE INDEX "game_levels_gameId_levelNumber_key" ON "game_levels"("gameId", "levelNumber");

-- CreateIndex
CREATE INDEX "user_game_sessions_userId_idx" ON "user_game_sessions"("userId");

-- CreateIndex
CREATE INDEX "user_game_sessions_gameId_idx" ON "user_game_sessions"("gameId");

-- CreateIndex
CREATE INDEX "user_game_sessions_levelId_idx" ON "user_game_sessions"("levelId");

-- CreateIndex
CREATE INDEX "exercises_packageId_idx" ON "exercises"("packageId");

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "exercise_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_package_completions" ADD CONSTRAINT "user_package_completions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_package_completions" ADD CONSTRAINT "user_package_completions_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "exercise_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_levels" ADD CONSTRAINT "game_levels_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_game_sessions" ADD CONSTRAINT "user_game_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_game_sessions" ADD CONSTRAINT "user_game_sessions_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_game_sessions" ADD CONSTRAINT "user_game_sessions_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "game_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;
