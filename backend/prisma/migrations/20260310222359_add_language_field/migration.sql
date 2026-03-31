-- AlterTable
ALTER TABLE "theses" ADD COLUMN     "language" VARCHAR(50);

-- CreateIndex
CREATE INDEX "theses_language_idx" ON "theses"("language");
