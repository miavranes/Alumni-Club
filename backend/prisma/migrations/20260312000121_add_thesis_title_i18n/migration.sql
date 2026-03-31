/*
  Warnings:

  - Added the required column `title_language` to the `theses` table without a default value. This is not possible if the table is not empty.
  - Made the column `year` on table `theses` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "theses"
ADD COLUMN     "additional_subtitle" VARCHAR(255),
ADD COLUMN     "additional_title" VARCHAR(255),
ADD COLUMN     "additional_title_language" VARCHAR(50),
ADD COLUMN     "subtitle" VARCHAR(255),
ADD COLUMN     "title_language" VARCHAR(50) NOT NULL DEFAULT 'en';

-- Backfill required data for existing rows
UPDATE "theses"
SET "year" = EXTRACT(YEAR FROM "created_at")::int
WHERE "year" IS NULL;

-- Ensure title_language has a value (safety for existing rows)
UPDATE "theses"
SET "title_language" = 'en'
WHERE "title_language" IS NULL;

ALTER TABLE "theses"
ALTER COLUMN "year" SET NOT NULL,
ALTER COLUMN "title_language" DROP DEFAULT;
