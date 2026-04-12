-- CreateTable
CREATE TABLE "HealthPlan" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "HealthPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Revenue" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "health_plan_id" INTEGER,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Revenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HealthPlan_name_key" ON "HealthPlan"("name");

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_health_plan_id_fkey" FOREIGN KEY ("health_plan_id") REFERENCES "HealthPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
