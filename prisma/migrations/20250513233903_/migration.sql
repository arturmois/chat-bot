/*
  Warnings:

  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Customer";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Chat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "phone_number" TEXT NOT NULL,
    "instance_key" TEXT NOT NULL,
    "message_step" TEXT NOT NULL DEFAULT 'STEP_0'
);

-- CreateIndex
CREATE UNIQUE INDEX "Chat_phone_number_key" ON "Chat"("phone_number");
