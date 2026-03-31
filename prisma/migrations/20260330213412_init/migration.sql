-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);
