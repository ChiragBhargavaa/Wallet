-- CreateTable
CREATE TABLE "PeerTransfer" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "OnRampStatus" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,

    CONSTRAINT "PeerTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PeerTransfer_token_key" ON "PeerTransfer"("token");

-- AddForeignKey
ALTER TABLE "PeerTransfer" ADD CONSTRAINT "PeerTransfer_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeerTransfer" ADD CONSTRAINT "PeerTransfer_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
