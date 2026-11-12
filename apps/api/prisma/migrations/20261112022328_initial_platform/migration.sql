-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'GYM_STAFF', 'PLATFORM_ADMIN');

-- CreateEnum
CREATE TYPE "TokenKind" AS ENUM ('VERIFY', 'RESET');

-- CreateEnum
CREATE TYPE "GymStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED');

-- CreateEnum
CREATE TYPE "OfferKind" AS ENUM ('DAY_PASS', 'MEMBERSHIP');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "googleSub" TEXT,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "credentialVersion" INTEGER NOT NULL DEFAULT 0,
    "emailVerifiedAt" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "gymId" TEXT,
    "nearby" BOOLEAN NOT NULL DEFAULT false,
    "newsletter" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialVersion" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("tokenHash")
);

-- CreateTable
CREATE TABLE "AuthToken" (
    "tokenHash" TEXT NOT NULL,
    "kind" "TokenKind" NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthToken_pkey" PRIMARY KEY ("tokenHash")
);

-- CreateTable
CREATE TABLE "MailJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "encryptedPayload" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MailJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateBucket" (
    "id" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateBucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthState" (
    "stateHash" TEXT NOT NULL,
    "encryptedVerifier" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "linkUserId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OAuthState_pkey" PRIMARY KEY ("stateHash")
);

-- CreateTable
CREATE TABLE "Gym" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "equipment" TEXT[],
    "services" TEXT[],
    "hours" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "demo" BOOLEAN NOT NULL DEFAULT true,
    "status" "GymStatus" NOT NULL DEFAULT 'PENDING',
    "settlementCents" INTEGER NOT NULL DEFAULT 900,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gym_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "kind" "OfferKind" NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PEN',
    "visits" INTEGER NOT NULL,
    "validityDays" INTEGER NOT NULL,
    "maxPerDay" INTEGER NOT NULL DEFAULT 1,
    "maxPerGym" INTEGER NOT NULL,
    "conditions" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "demo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "offerId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "visits" INTEGER NOT NULL,
    "validityDays" INTEGER NOT NULL,
    "maxPerDay" INTEGER NOT NULL,
    "maxPerGym" INTEGER NOT NULL,
    "eligibleGymIds" TEXT[],
    "conditions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pass" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "orderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "remaining" INTEGER NOT NULL,
    "visits" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "maxPerDay" INTEGER NOT NULL,
    "maxPerGym" INTEGER NOT NULL,
    "eligibleGymIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckInToken" (
    "tokenHash" TEXT NOT NULL,
    "passId" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),

    CONSTRAINT "CheckInToken_pkey" PRIMARY KEY ("tokenHash")
);

-- CreateTable
CREATE TABLE "CheckIn" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT,
    "gymId" TEXT NOT NULL,
    "passId" TEXT NOT NULL,
    "validatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL,
    "checkInId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GymToOffer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GymToOffer_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleSub_key" ON "User"("googleSub");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "AuthToken_userId_kind_idx" ON "AuthToken"("userId", "kind");

-- CreateIndex
CREATE INDEX "MailJob_sentAt_availableAt_idx" ON "MailJob"("sentAt", "availableAt");

-- CreateIndex
CREATE INDEX "RateBucket_expiresAt_idx" ON "RateBucket"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Gym_slug_key" ON "Gym"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Order_userId_idempotencyKey_key" ON "Order"("userId", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Pass_orderId_key" ON "Pass"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "CheckIn_tokenHash_key" ON "CheckIn"("tokenHash");

-- CreateIndex
CREATE INDEX "CheckIn_passId_gymId_createdAt_idx" ON "CheckIn"("passId", "gymId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Settlement_checkInId_key" ON "Settlement"("checkInId");

-- CreateIndex
CREATE INDEX "_GymToOffer_B_index" ON "_GymToOffer"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthToken" ADD CONSTRAINT "AuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MailJob" ADD CONSTRAINT "MailJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pass" ADD CONSTRAINT "Pass_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pass" ADD CONSTRAINT "Pass_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckInToken" ADD CONSTRAINT "CheckInToken_passId_fkey" FOREIGN KEY ("passId") REFERENCES "Pass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_tokenHash_fkey" FOREIGN KEY ("tokenHash") REFERENCES "CheckInToken"("tokenHash") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_passId_fkey" FOREIGN KEY ("passId") REFERENCES "Pass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "CheckIn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GymToOffer" ADD CONSTRAINT "_GymToOffer_A_fkey" FOREIGN KEY ("A") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GymToOffer" ADD CONSTRAINT "_GymToOffer_B_fkey" FOREIGN KEY ("B") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
