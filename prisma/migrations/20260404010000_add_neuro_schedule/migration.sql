-- CreateTable
CREATE TABLE "NeuroSchedule" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NeuroSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NeuroSchedule_patient_id_idx" ON "NeuroSchedule"("patient_id");

-- AddForeignKey
ALTER TABLE "NeuroSchedule" ADD CONSTRAINT "NeuroSchedule_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
