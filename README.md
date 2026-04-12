# Lapidar SaaS - Backend

Clinica Management System Backend API

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- PostgreSQL 12+
- npm ou yarn

### Setup Local

1. **Clone o repositório**
```bash
git clone <repository>
cd lapidar-saas
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Setup do banco de dados**
```bash
# Execute as migrações
npx prisma migrate dev

# (Opcional) Execute o seed
npm run seed
```

5. **Inicie o servidor**
```bash
npm run start
```

O servidor estará rodando em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
src/
├── app.js                 # Aplicação Express
├── server.js              # Entrada do servidor
├── lib/
│   └── prisma.js          # Cliente Prisma
├── middleware/
│   ├── auth.middleware.js # Autenticação JWT
│   └── role.middleware.js # Autorização por roles
└── modules/
    ├── auth/              # Autenticação
    ├── patients/          # Gerenciamento de pacientes
    ├── sessions/          # Gerenciamento de sessões
    ├── users/             # Gerenciamento de usuários
    └── finance/           # Gerenciamento financeiro

prisma/
├── schema.prisma          # Esquema do banco de dados
├── migrations/            # Histórico de migrações
└── seed.js                # Seeds iniciais
```

## 🔐 Segurança

- Senhas são criptografadas com bcrypt
- Autenticação via JWT
- Autorização por roles (admin, user)
- CORS configurado
- Validação de entrada nos controllers

## 📡 API Endpoints

### Autenticação
- `POST /login` - Login de usuário

### Pacientes
- `GET /patients` - Listar todos os pacientes
- `GET /patients/:id` - Obter paciente por ID
- `POST /patients` - Criar novo paciente
- `PUT /patients/:id` - Atualizar paciente
- `DELETE /patients/:id` - Deletar paciente

### Sessões
- `POST /sessions/bulk` - Criar múltiplas sessões

### Finanças
- `GET /finance` - Listar transações
- `GET /finance/summary` - Obter resumo financeiro
- `POST /finance` - Criar transação
- `DELETE /finance/:id` - Deletar transação

### Usuários
- `GET /users` - Listar usuários (admin only)
- `POST /users` - Criar usuário (admin only)

### Health Check
- `GET /health` - Verificar se o servidor está rodando

## 🔑 Roles (Papéis)

- **admin** - Acesso completo
- **user** - Acesso limitado (pacientes, finanças)

## 📝 Scripts

```bash
# Iniciar servidor em modo desenvolvimento
npm run start

# Seed do banco com dados iniciais
npm run seed

# Prisma Studio (visualize o banco)
npx prisma studio

# Gerar/testar migrações
npx prisma migrate dev
```

## 🛠️ Tecnologias

- **Express** - Framework web
- **Prisma** - ORM
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **CORS** - Cross-origin resource sharing

## 📋 Variáveis de Ambiente

```
DATABASE_URL    - String de conexão PostgreSQL
JWT_SECRET      - Chave secreta para JWT
PORT            - Porta do servidor (padrão: 3000)
NODE_ENV        - Ambiente (development/production)
```

## 🐛 Troubleshooting

### Erro: "Cannot find module"
```bash
npm install
```

### Erro de conexão com PostgreSQL
- Verificar se PostgreSQL está rodando
- Verificar DATABASE_URL em .env
- Verificar credenciais do banco

### Erro: "Prisma not found"
```bash
npm install -D prisma
npx prisma generate
```

## 📞 Contato

Para reportar bugs ou sugestões, abra uma issue no repositório.
