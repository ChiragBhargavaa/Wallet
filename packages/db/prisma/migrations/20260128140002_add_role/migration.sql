-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'MERCHANT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER',
ALTER COLUMN "password" DROP NOT NULL;
