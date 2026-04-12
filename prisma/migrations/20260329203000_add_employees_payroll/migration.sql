-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "absences" INTEGER NOT NULL DEFAULT 0,
    "daily_value" DOUBLE PRECISION NOT NULL,
    "updated_value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);
