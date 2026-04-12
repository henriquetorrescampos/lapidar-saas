import express from "express";
import rateLimit from "express-rate-limit";
import { loginController } from "./auth.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { getMeController } from "./auth.controller.js";

const router = express.Router();

// Rate limit para proteger contra brute force no login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 tentativas por IP
  message: {
    error: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// rota pública (sem token)
router.post("/login", loginLimiter, loginController);

// rota autenticada — retorna dados do usuário logado
router.get("/me", authMiddleware, getMeController);

export default router;
