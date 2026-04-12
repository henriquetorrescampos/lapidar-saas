/*
  Warnings:

  - Added the required column `birth_date` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "birth_date" TIMESTAMP(3) NOT NULL;
