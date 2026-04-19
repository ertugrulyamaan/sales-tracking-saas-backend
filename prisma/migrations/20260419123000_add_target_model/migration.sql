-- CreateTable
CREATE TABLE "Target" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "targetSalesAmount" DECIMAL(10,2) NOT NULL,
    "targetSalesCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Target_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Target_workspaceId_weekStartDate_idx" ON "Target"("workspaceId", "weekStartDate");

-- CreateIndex
CREATE UNIQUE INDEX "Target_workspaceId_weekStartDate_key" ON "Target"("workspaceId", "weekStartDate");

-- AddForeignKey
ALTER TABLE "Target" ADD CONSTRAINT "Target_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
