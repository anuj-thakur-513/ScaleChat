/*
  Warnings:

  - You are about to drop the column `chat_id` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `chat_id` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_chat_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_chat_id_fkey";

-- AlterTable
ALTER TABLE "chats" ADD COLUMN     "messages" INTEGER[],
ADD COLUMN     "participants" INTEGER[];

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "chat_id";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "chat_id";
