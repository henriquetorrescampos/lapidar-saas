# Lapidar Frontend

Frontend em React para o sistema de gerenciamento de clínica Lapidar.

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 16+
- npm ou yarn

### Passos de instalação

1. **Instale as dependências:**
```bash
npm install
```

2. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

3. **Atualize o `VITE_API_URL` no `.env`:**
```env
VITE_API_URL=http://localhost:3000
```

## 🔄 Iniciando o projeto

### Desenvolvimento
```bash
npm run dev
```

Acesse: `http://localhost:5173`

### Build para produção
```bash
npm run build
```

### Preview da build
```bash
npm run preview
```

## 📁 Estrutura do Projeto

```
src/
├── assets/           # Imagens e arquivos estáticos
├── components/       # Componentes reutilizáveis
│   ├── Layout/      # Header, Sidebar
│   ├── Common/      # Button, Card, Modal, Alert
│   └── Dashboard/   # Componentes do dashboard
├── context/         # Context API (Autenticação)
├── hooks/           # Hooks customizados
├── pages/           # Páginas da aplicação
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Patients/    # Gerenciamento de pacientes
│   ├── Users/       # Gerenciamento de usuários
│   ├── Finance/     # Gerenciamento de finanças
│   └── Appointments/ # Agendamentos
├── services/        # Serviços de API
├── App.jsx          # Configuração de rotas
├── main.jsx         # Entrada
└── index.css        # Estilos globais
```

## 🔐 Autenticação

O sistema usa JWT para autenticação. O token é armazenado no localStorage e enviado em todas as requisições.

### Roles disponíveis
- **admin**: Acesso completo
- **user**: Acesso limitado (pacientes e agendamentos)

## 🎨 Tecnologias

- **React 18** - Interface de usuário
- **React Router 6** - Roteamento
- **Axios** - HTTP client
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **Vite** - Build tool

## 📝 Principais funcionalidades

### 👥 Pacientes
- Listar pacientes
- Criar novo paciente
- Editar paciente
- Deletar paciente

### 📅 Agendamentos
- Criar agendamentos
- Gerenciar especialidades

### 👨‍💼 Usuários (Admin)
- Listar usuários
- Criar novo usuário
- Definir roles

### 💰 Finanças (Admin)
- Registrar receitas e despesas
- Visualizar resumo financeiro
- Ver histórico de transações

## 🔗 Endpoints da API

Base URL: `http://localhost:3000`

- `POST /login` - Login
- `GET/POST/PUT/DELETE /patients` - Pacientes
- `POST /sessions/bulk` - Criar agendamentos
- `GET/POST /users` - Usuários
- `GET/POST/DELETE /finance` - Finanças

## 📦 Build e Deploy

### Docker (opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## ✅ Checklist de Desenvolvimento

- [x] Autenticação com JWT
- [x] Layout responsivo
- [x] Gerenciamento de pacientes
- [x] Agendamentos
- [x] Gerenciamento de usuários
- [x] Módulo financeiro
- [x] Proteção de rotas
- [x] Componentes reutilizáveis
- [x] Tratamento de erros
- [x] Validações

## 🐛 Troubleshooting

### A API não está respondendo
1. Verifique se o backend está rodando em `http://localhost:3000`
2. Confirme que `VITE_API_URL` está correto no `.env`

### CORS Error
Certifique-se que o backend tem CORS habilitado para `http://localhost:5173`

## 📄 Licença

ISC
