/*
  Warnings:

  - You are about to drop the `lecturers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "lecturers" DROP CONSTRAINT "lecturers_departmentId_fkey";

-- DropTable
DROP TABLE "lecturers";
