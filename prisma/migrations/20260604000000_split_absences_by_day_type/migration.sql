-- AlterTable: replace absences with full_day_absences and partial_day_absences
ALTER TABLE "Employee"
  ADD COLUMN "full_day_absences"    INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "partial_day_absences" INTEGER NOT NULL DEFAULT 0;

UPDATE "Employee" SET "full_day_absences" = "absences";

ALTER TABLE "Employee" DROP COLUMN "absences";
