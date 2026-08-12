-- AlterTable
ALTER TABLE "QuizQuestion" ADD COLUMN     "campaignId" TEXT;

-- CreateIndex
CREATE INDEX "QuizQuestion_campaignId_idx" ON "QuizQuestion"("campaignId");

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
