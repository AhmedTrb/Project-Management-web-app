-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "bestCaseDuration" INTEGER,
ADD COLUMN     "expectedDuration" DOUBLE PRECISION,
ADD COLUMN     "worstCaseDuration" INTEGER;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "earliestFinish" INTEGER,
ADD COLUMN     "earliestStart" INTEGER,
ADD COLUMN     "expectedDuration" DOUBLE PRECISION,
ADD COLUMN     "isCritical" BOOLEAN DEFAULT false,
ADD COLUMN     "latestFinish" INTEGER,
ADD COLUMN     "latestStart" INTEGER,
ADD COLUMN     "mostLikelyDuration" INTEGER,
ADD COLUMN     "optimisticDuration" INTEGER,
ADD COLUMN     "pessimisticDuration" INTEGER,
ADD COLUMN     "totalFloat" INTEGER;
