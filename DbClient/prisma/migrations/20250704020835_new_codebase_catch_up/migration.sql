/*
  Warnings:

  - The values [UPPER_INTERMIDIATE] on the enum `ExerciseDifficulty` will be removed. If these variants are still used in the database, this will fail.
  - The values [LETTER_SOUP,CROSSWORD,TIMELINE_SORTING,TRUE_OR_FALSE,CANDY_CRUSH] on the enum `ExerciseType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `title` on the `testimonies` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `ExtraPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `game_levels` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `games` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `page_config` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `statistics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_game_sessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ExerciseDifficulty_new" AS ENUM ('BEGINNER', 'UPPER_BEGINNER', 'INTERMEDIATE', 'UPPER_INTERMEDIATE', 'ADVANCED', 'SUPER_ADVANCED');
ALTER TABLE "exercises" ALTER COLUMN "difficulty" DROP DEFAULT;
ALTER TABLE "exercises" ALTER COLUMN "difficulty" TYPE "ExerciseDifficulty_new" USING ("difficulty"::text::"ExerciseDifficulty_new");
ALTER TYPE "ExerciseDifficulty" RENAME TO "ExerciseDifficulty_old";
ALTER TYPE "ExerciseDifficulty_new" RENAME TO "ExerciseDifficulty";
DROP TYPE "ExerciseDifficulty_old";
ALTER TABLE "exercises" ALTER COLUMN "difficulty" SET DEFAULT 'INTERMEDIATE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ExerciseType_new" AS ENUM ('FILL_BLANK', 'MATCHING', 'MULTIPLE_CHOICE', 'ORDERING', 'CATEGORIZER', 'SELECTOR', 'READING', 'CONVERSATION', 'PUZZLE');
ALTER TABLE "exercises" ALTER COLUMN "type" TYPE "ExerciseType_new" USING ("type"::text::"ExerciseType_new");
ALTER TYPE "ExerciseType" RENAME TO "ExerciseType_old";
ALTER TYPE "ExerciseType_new" RENAME TO "ExerciseType";
DROP TYPE "ExerciseType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "game_levels" DROP CONSTRAINT "game_levels_gameId_fkey";

-- DropForeignKey
ALTER TABLE "user_game_sessions" DROP CONSTRAINT "user_game_sessions_gameId_fkey";

-- DropForeignKey
ALTER TABLE "user_game_sessions" DROP CONSTRAINT "user_game_sessions_levelId_fkey";

-- DropForeignKey
ALTER TABLE "user_game_sessions" DROP CONSTRAINT "user_game_sessions_userId_fkey";

-- AlterTable
ALTER TABLE "exercise_packages" ADD COLUMN     "article" TEXT;

-- AlterTable
ALTER TABLE "testimonies" DROP COLUMN "title";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "country",
ADD COLUMN     "exp" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "ExtraPost";

-- DropTable
DROP TABLE "game_levels";

-- DropTable
DROP TABLE "games";

-- DropTable
DROP TABLE "page_config";

-- DropTable
DROP TABLE "statistics";

-- DropTable
DROP TABLE "user_game_sessions";

-- DropEnum
DROP TYPE "GameType";

-- CreateTable
CREATE TABLE "PackageDifficultyBox" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL,
    "title" TEXT NOT NULL,
    "article" TEXT NOT NULL,

    CONSTRAINT "PackageDifficultyBox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_config" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'EduGuiders',
    "description" TEXT NOT NULL,
    "tagline" TEXT,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT,
    "telegram" TEXT,
    "supportEmail" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "linkedin" TEXT,
    "youtube" TEXT,
    "tiktok" TEXT,
    "instagramPosts" TEXT[],
    "tiktokPosts" TEXT[],
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "keywords" TEXT[],
    "favicon" TEXT,
    "logo" TEXT,
    "logoAlt" TEXT,
    "enableRegistration" BOOLEAN NOT NULL DEFAULT true,
    "enableTeacherProfiles" BOOLEAN NOT NULL DEFAULT true,
    "enableExercisePackages" BOOLEAN NOT NULL DEFAULT true,
    "enableGames" BOOLEAN NOT NULL DEFAULT true,
    "enableTestimonials" BOOLEAN NOT NULL DEFAULT true,
    "enableBlog" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "welcomeMessage" TEXT,
    "footerText" TEXT,
    "privacyPolicyUrl" TEXT,
    "termsOfServiceUrl" TEXT,
    "aboutUsContent" TEXT,
    "defaultLanguage" "Language" NOT NULL DEFAULT 'ENGLISH',
    "supportedLanguages" "Language"[],
    "googleAnalyticsId" TEXT,
    "facebookPixelId" TEXT,
    "hotjarId" TEXT,
    "supportEmailName" TEXT DEFAULT 'EduGuiders Support',
    "noReplyEmail" TEXT,
    "emailSignature" TEXT,
    "pointsPerExercise" INTEGER NOT NULL DEFAULT 10,
    "pointsPerPackageComplete" INTEGER NOT NULL DEFAULT 100,
    "maxApiRequestsPerHour" INTEGER NOT NULL DEFAULT 1000,
    "enablePublicApi" BOOLEAN NOT NULL DEFAULT false,
    "webhookSecret" TEXT,
    "maxImageSize" INTEGER NOT NULL DEFAULT 5242880,
    "maxVideoSize" INTEGER NOT NULL DEFAULT 52428800,
    "allowedImageTypes" TEXT[] DEFAULT ARRAY['jpg', 'jpeg', 'png', 'gif']::TEXT[],
    "allowedVideoTypes" TEXT[] DEFAULT ARRAY['mp4', 'webm', 'mov']::TEXT[],
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "description" TEXT,
    "dataType" TEXT NOT NULL DEFAULT 'string',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "config_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PackageDifficultyBox_packageId_difficulty_key" ON "PackageDifficultyBox"("packageId", "difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "config_settings_key_key" ON "config_settings"("key");

-- CreateIndex
CREATE INDEX "config_settings_category_idx" ON "config_settings"("category");

-- CreateIndex
CREATE INDEX "config_settings_isPublic_idx" ON "config_settings"("isPublic");

-- AddForeignKey
ALTER TABLE "PackageDifficultyBox" ADD CONSTRAINT "PackageDifficultyBox_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "exercise_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
