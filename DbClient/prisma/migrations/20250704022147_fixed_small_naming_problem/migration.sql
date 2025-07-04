/*
  Warnings:

  - You are about to drop the `site_config` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "site_config";

-- CreateTable
CREATE TABLE "page_config" (
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

    CONSTRAINT "page_config_pkey" PRIMARY KEY ("id")
);
