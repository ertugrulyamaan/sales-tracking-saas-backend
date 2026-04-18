-- CreateTable
CREATE TABLE "SaleRecord" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "salesCount" INTEGER NOT NULL,
    "salesAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundRecord" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "refundCount" INTEGER NOT NULL,
    "refundAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefundRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SaleRecord_workspaceId_date_idx" ON "SaleRecord"("workspaceId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "SaleRecord_workspaceId_date_key" ON "SaleRecord"("workspaceId", "date");

-- CreateIndex
CREATE INDEX "RefundRecord_workspaceId_date_idx" ON "RefundRecord"("workspaceId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "RefundRecord_workspaceId_date_key" ON "RefundRecord"("workspaceId", "date");

-- AddForeignKey
ALTER TABLE "SaleRecord" ADD CONSTRAINT "SaleRecord_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRecord" ADD CONSTRAINT "RefundRecord_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
