# 📊 API de Finanças - Documentação

## Endpoints de Receitas

### Criar Receita
**POST** `/finance/revenue`

```json
{
  "source": "health_plan" ou "particular",
  "health_plan_id": 1,  // obrigatório se source = "health_plan"
  "amount": 1500.50,
  "description": "Consulta - Paciente João"
}
```

**Response**: 201 Created
```json
{
  "id": 1,
  "source": "health_plan",
  "health_plan_id": 1,
  "amount": 1500.50,
  "description": "Consulta - Paciente João",
  "date": "2026-03-25T10:30:00Z",
  "health_plan": {
    "id": 1,
    "name": "Unimed"
  }
}
```

### Listar Receitas
**GET** `/finance/revenue?source=health_plan&date_from=2026-03-01&date_to=2026-03-31`

Parâmetros opcionais:
- `source`: "health_plan" ou "particular"
- `health_plan_id`: ID do plano de saúde
- `date_from`: Data inicial (YYYY-MM-DD)
- `date_to`: Data final (YYYY-MM-DD)

### Faturamento por Plano de Saúde
**GET** `/finance/revenue/by-health-plan`

```json
[
  {
    "health_plan_id": 1,
    "_sum": {
      "amount": 5000.00
    },
    "_count": {
      "id": 3
    }
  }
]
```

### Deletar Receita
**DELETE** `/finance/revenue/:id`

---

## Endpoints de Despesas

### Criar Despesa
**POST** `/finance/expense`

```json
{
  "category": "salario|aluguel|energia|agua|internet|imposto|outros",
  "amount": 5000.00,
  "description": "Salário - Setembro 2026"
}
```

**Response**: 201 Created

### Listar Despesas
**GET** `/finance/expense?category=salario&date_from=2026-03-01&date_to=2026-03-31`

Parâmetros opcionais:
- `category`: Categoria da despesa
- `date_from`: Data inicial
- `date_to`: Data final

### Despesas por Categoria
**GET** `/finance/expense/by-category`

```json
[
  {
    "category": "salario",
    "_sum": {
      "amount": 15000.00
    },
    "_count": {
      "id": 1
    }
  }
]
```

### Deletar Despesa
**DELETE** `/finance/expense/:id`

---

## Dashboard Financeiro

### Indicadores Consolidados
**GET** `/finance/dashboard?date_from=2026-03-01&date_to=2026-03-31`

```json
{
  "gross_revenue": 25000.00,           // Faturamento bruto total
  "tax": 2500.00,                      // Impostos
  "operational_costs": 8000.00,        // Custos operacionais (sem imposto)
  "total_expenses": 10500.00,          // Total de despesas
  "net_profit": 14500.00,              // Lucro líquido
  "margin": "58.00",                   // Margem de lucro %
  "revenue_by_source": {
    "health_plan": 20000.00,
    "particular": 5000.00
  },
  "expense_by_category": {
    "salario": 5000.00,
    "aluguel": 2000.00,
    "energia": 500.00,
    "agua": 300.00,
    "internet": 200.00,
    "imposto": 2500.00,
    "outros": 0.00
  },
  "revenue_count": 15,
  "expense_count": 6
}
```

---

## Endpoints de Planos de Saúde

### Criar Plano de Saúde
**POST** `/finance/health-plan`

```json
{
  "name": "Unimed Premium"
}
```

### Listar Planos de Saúde
**GET** `/finance/health-plan`

```json
[
  {
    "id": 1,
    "name": "Unimed",
    "revenue": [
      {
        "id": 1,
        "source": "health_plan",
        "health_plan_id": 1,
        "amount": 1500.00,
        "description": "Consulta",
        "date": "2026-03-25T10:30:00Z"
      }
    ]
  }
]
```

---

## Categorias de Despesa

- `salario` - Salário/Pessoal
- `aluguel` - Aluguel
- `energia` - Energia
- `agua` - Água
- `internet` - Internet
- `imposto` - Imposto
- `outros` - Outros Custos

---

## Fontes de Receita

- `health_plan` - Faturamento via plano de saúde
- `particular` - Faturamento particular

---

## Exemplo de Uso Completo

```bash
# 1. Criar plano de saúde (opcional, já vem no seed)
curl -X POST http://localhost:3000/finance/health-plan \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Unimed Gold"}'

# 2. Registrar receita via plano
curl -X POST http://localhost:3000/finance/revenue \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "health_plan",
    "health_plan_id": 1,
    "amount": 2500.00,
    "description": "Consulta - Paciente João"
  }'

# 3. Registrar receita particular
curl -X POST http://localhost:3000/finance/revenue \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "particular",
    "amount": 500.00,
    "description": "Consulta particular"
  }'

# 4. Registrar despesa
curl -X POST http://localhost:3000/finance/expense \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "salario",
    "amount": 5000.00,
    "description": "Salário - Março 2026"
  }'

# 5. Ver dashboard
curl -X GET http://localhost:3000/finance/dashboard \
  -H "Authorization: Bearer TOKEN"

# 6. Faturamento por plano
curl -X GET http://localhost:3000/finance/revenue/by-health-plan \
  -H "Authorization: Bearer TOKEN"
```

---

## Frontend Components

### FinanceDashboard
Renderiza indicadores principais, gráficos de receita e despesa por categoria.

### RevenueForm & RevenueList
Formulário e lista de receitas com filtros.

### ExpenseForm & ExpenseList
Formulário e lista de despesas com filtros por categoria.

### HealthPlansManager
Gerenciador de planos de saúde com resumo de faturamento.

### Finance (main page)
Componente principal que agrupa todos os módulos com sistema de abas.
