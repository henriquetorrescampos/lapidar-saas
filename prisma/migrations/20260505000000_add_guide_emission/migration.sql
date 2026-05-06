-- CreateTable
CREATE TABLE "PatientSchedule" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "specialty" TEXT NOT NULL,
    "days" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "PatientSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideEmission" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "specialty" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "emitted" BOOLEAN NOT NULL DEFAULT false,
    "emitted_at" TIMESTAMP(3),

    CONSTRAINT "GuideEmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientSchedule_patient_id_specialty_key" ON "PatientSchedule"("patient_id", "specialty");

-- CreateIndex
CREATE INDEX "PatientSchedule_patient_id_idx" ON "PatientSchedule"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "GuideEmission_patient_id_specialty_month_year_key" ON "GuideEmission"("patient_id", "specialty", "month", "year");

-- CreateIndex
CREATE INDEX "GuideEmission_patient_id_idx" ON "GuideEmission"("patient_id");

-- CreateIndex
CREATE INDEX "GuideEmission_month_year_idx" ON "GuideEmission"("month", "year");

-- AddForeignKey
ALTER TABLE "PatientSchedule" ADD CONSTRAINT "PatientSchedule_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideEmission" ADD CONSTRAINT "GuideEmission_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
