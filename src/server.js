import app from "./app.js";

// Validar variáveis de ambiente obrigatórias antes de iniciar
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error(
    "FATAL: JWT_SECRET não está configurada ou é muito curta (mínimo 32 caracteres).",
  );
  console.error("Configure a variável JWT_SECRET no arquivo .env");
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // ✅ só aqui
});
