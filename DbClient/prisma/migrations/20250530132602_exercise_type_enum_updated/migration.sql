-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ExerciseType" ADD VALUE 'LETTER_SOUP';
ALTER TYPE "ExerciseType" ADD VALUE 'CROSSWORD';
ALTER TYPE "ExerciseType" ADD VALUE 'READING';
ALTER TYPE "ExerciseType" ADD VALUE 'TIMELINE_SORTING';
ALTER TYPE "ExerciseType" ADD VALUE 'TRUE_OR_FALSE';
ALTER TYPE "ExerciseType" ADD VALUE 'CANDY_CRUSH';
