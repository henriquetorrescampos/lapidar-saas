import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

console.log("Starting app.js");

import patientRoutes from "./modules/patients/patient.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import financeRoutes from "./modules/finance/finance.routes.js";
import sessionRoutes from "./modules/sessions/session.routes.js";

console.log("Routes imported");

dotenv.config();

const app = express();

console.log("App created");

// Middlewares
app.use(cors());
// app.use(bodyParser.json());

// Test route
app.get("/test", (req, res) => {
  console.log("Test route called");
  res.json({ message: "App routes working" });
});

// Routes
import express from "express";
