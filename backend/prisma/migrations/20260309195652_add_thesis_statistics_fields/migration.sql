-- AlterTable
ALTER TABLE "theses" ADD COLUMN     "committee_members" TEXT,
ADD COLUMN     "grade" VARCHAR(10),
ADD COLUMN     "keywords" TEXT,
ADD COLUMN     "mentor" VARCHAR(255),
ADD COLUMN     "topic" VARCHAR(255);

-- CreateIndex
CREATE INDEX "theses_mentor_idx" ON "theses"("mentor");

-- CreateIndex
CREATE INDEX "theses_grade_idx" ON "theses"("grade");

-- CreateIndex
CREATE INDEX "theses_topic_idx" ON "theses"("topic");
