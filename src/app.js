import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import patientRoutes from "./modules/patients/patient.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import financeRoutes from "./modules/finance/finance.routes.js";
import sessionRoutes from "./modules/sessions/session.routes.js";
import employeeRoutes from "./modules/employees/employee.routes.js";
import neuroScheduleRoutes from "./modules/neuro-schedule/neuro-schedule.routes.js";
import guideEmissionRoutes from "./modules/guide-emission/guide-emission.routes.js";

dotenv.config();

// Prisma $queryRaw retorna BigInt para colunas SERIAL — patch global para serialização JSON
BigInt.prototype.toJSON = function () {
  return Number(this);
};

const app = express();

// Headers de segurança HTTP
app.use(helmet());

// CORS restrito à origem do frontend
const allowedOrigins = (
  process.env.CORS_ORIGIN || "http://localhost:5173"
).split(",");
app.use(
  cors({
    origin(origin, callback) {
      // Permitir requests sem origin (mobile apps, curl, etc em dev)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);

// Body parser com limite de tamanho (proteção contra payload DoS)
app.use(express.json({ limit: "1mb" }));

app.use("/", authRoutes);
app.use("/patients", patientRoutes);
app.use("/finance", financeRoutes);
app.use("/users", userRoutes);
app.use("/sessions", sessionRoutes);
app.use("/employees", employeeRoutes);
app.use("/neuro-schedules", neuroScheduleRoutes);
app.use("/guide-emissions", guideEmissionRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3000;

export default app;
