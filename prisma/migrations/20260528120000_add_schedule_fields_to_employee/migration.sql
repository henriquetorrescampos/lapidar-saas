-- AlterTable: replace working_days with schedule-based fields
ALTER TABLE "Employee" DROP COLUMN "working_days";

ALTER TABLE "Employee"
  ADD COLUMN "full_days_per_week"    INTEGER          NOT NULL DEFAULT 0,
  ADD COLUMN "full_day_hours"        DOUBLE PRECISION NOT NULL DEFAULT 10,
  ADD COLUMN "partial_days_per_week" INTEGER          NOT NULL DEFAULT 0,
  ADD COLUMN "partial_day_hours"     DOUBLE PRECISION NOT NULL DEFAULT 4,
  ADD COLUMN "hourly_value"          DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "partial_day_value"     DOUBLE PRECISION NOT NULL DEFAULT 0;
