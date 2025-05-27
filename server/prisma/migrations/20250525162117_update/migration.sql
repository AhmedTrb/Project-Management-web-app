/*
  Warnings:

  - You are about to drop the column `expectedDuration` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `isCritical` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `mostLikelyDuration` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `optimisticDuration` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `pessimisticDuration` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `totalFloat` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "expectedDuration",
DROP COLUMN "isCritical",
DROP COLUMN "mostLikelyDuration",
DROP COLUMN "optimisticDuration",
DROP COLUMN "pessimisticDuration",
DROP COLUMN "totalFloat",
ADD COLUMN     "isCriticalPath" BOOLEAN DEFAULT false,
ADD COLUMN     "slack" INTEGER DEFAULT 0,
ALTER COLUMN "earliestFinish" SET DEFAULT 0,
ALTER COLUMN "earliestStart" SET DEFAULT 0,
ALTER COLUMN "latestFinish" SET DEFAULT 0,
ALTER COLUMN "latestStart" SET DEFAULT 0;
