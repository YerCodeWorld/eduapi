/*
  Warnings:

  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `category_on_post` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "category_on_post" DROP CONSTRAINT "category_on_post_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "category_on_post" DROP CONSTRAINT "category_on_post_postId_fkey";

-- DropTable
DROP TABLE "categories";

-- DropTable
DROP TABLE "category_on_post";
