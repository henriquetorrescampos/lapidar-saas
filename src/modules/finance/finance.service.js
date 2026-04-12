import { prisma } from "../../lib/prisma.js";
import { validateRequired, validateNumberId } from "../../lib/validators.js";

// Constantes de categorias
export const EXPENSE_CATEGORIES = {
  SALARY: "salario",
  RENT: "aluguel",
  ENERGY: "energia",
  WATER: "agua",
  INTERNET: "internet",
  TAX: "imposto",
  OTHER: "outros",
};

export const REVENUE_SOURCES = {
  HEALTH_PLAN: "health_plan",
  PARTICULAR: "particular",
};

// ============ RECEITAS ============

export async function createRevenue(data) {
  validateRequired(data.source, "Source");
  validateRequired(data.amount, "Amount");

  if (
    ![REVENUE_SOURCES.HEALTH_PLAN, REVENUE_SOURCES.PARTICULAR].includes(
      data.source,
    )
  ) {
    throw new Error("Invalid source. Must be 'health_plan' or 'particular'");
  }

  if (data.amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  // Se source é health_plan, health_plan_id é obrigatório
  if (data.source === REVENUE_SOURCES.HEALTH_PLAN) {
    validateRequired(data.health_plan_id, "Health Plan ID");
  }

  return await prisma.revenue.create({
    data: {
      source: data.source,
      health_plan_id: data.health_plan_id
        ? parseInt(data.health_plan_id)
        : null,
      amount: parseFloat(data.amount),
      description: data.description?.trim() || null,
    },
    include: {
      health_plan: true,
    },
  });
}

export async function getRevenues(filters = {}) {
  const where = {};

  if (filters.source) {
    where.source = filters.source;
  }

  if (filters.health_plan_id) {
    where.health_plan_id = parseInt(filters.health_plan_id);
  }

  if (filters.date_from || filters.date_to) {
    where.date = {};
    if (filters.date_from) {
      where.date.gte = new Date(filters.date_from);
    }
    if (filters.date_to) {
      where.date.lte = new Date(filters.date_to);
    }
  }

  return await prisma.revenue.findMany({
    where,
    include: {
      health_plan: true,
    },
    orderBy: {
      date: "desc",
    },
  });
}

export async function getRevenueByHealthPlan() {
  return await prisma.revenue.groupBy({
    by: ["health_plan_id"],
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
    where: {
      health_plan_id: {
        not: null,
      },
    },
  });
}

export async function deleteRevenue(id) {
  const revenueId = validateNumberId(id);

  const revenue = await prisma.revenue.findUnique({
    where: { id: revenueId },
  });

  if (!revenue) {
    throw new Error("Revenue not found");
  }

  return await prisma.revenue.delete({
    where: { id: revenueId },
  });
}

// ============ DESPESAS ============

export async function createExpense(data) {
  validateRequired(data.category, "Category");
  validateRequired(data.amount, "Amount");

  const validCategories = Object.values(EXPENSE_CATEGORIES);
  if (!validCategories.includes(data.category)) {
    throw new Error(
      `Invalid category. Must be one of: ${validCategories.join(", ")}`,
    );
  }

  if (data.amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  return await prisma.expense.create({
    data: {
      category: data.category,
      amount: parseFloat(data.amount),
      description: data.description?.trim() || null,
    },
  });
}

export async function getExpenses(filters = {}) {
  const where = {};

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.date_from || filters.date_to) {
    where.date = {};
    if (filters.date_from) {
      where.date.gte = new Date(filters.date_from);
    }
    if (filters.date_to) {
      where.date.lte = new Date(filters.date_to);
    }
  }

  return await prisma.expense.findMany({
    where,
    orderBy: {
      date: "desc",
    },
  });
}

export async function getExpenseByCategory() {
  return await prisma.expense.groupBy({
    by: ["category"],
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
  });
}

export async function deleteExpense(id) {
  const expenseId = validateNumberId(id);

  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
  });

  if (!expense) {
    throw new Error("Expense not found");
  }

  return await prisma.expense.delete({
    where: { id: expenseId },
  });
}

// ============ DASHBOARD / INDICADORES ============

export async function getFinancialDashboard(filters = {}) {
  // Receitas
  const revenues = await getRevenues(filters);
  const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);

  // Receita por fonte
  const revenueBySource = {
    health_plan: revenues
      .filter((r) => r.source === REVENUE_SOURCES.HEALTH_PLAN)
      .reduce((sum, r) => sum + r.amount, 0),
    particular: revenues
      .filter((r) => r.source === REVENUE_SOURCES.PARTICULAR)
      .reduce((sum, r) => sum + r.amount, 0),
  };

  // Despesas
  const expenses = await getExpenses(filters);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Despesas por categoria
  const expenseByCategory = {};
  Object.values(EXPENSE_CATEGORIES).forEach((cat) => {
    expenseByCategory[cat] = expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);
  });

  // Receita por plano de saúde (filtrado por data)
  const revenueByHealthPlan = {};
  revenues
    .filter((r) => r.source === REVENUE_SOURCES.HEALTH_PLAN && r.health_plan)
    .forEach((r) => {
      if (!revenueByHealthPlan[r.health_plan.name]) {
        revenueByHealthPlan[r.health_plan.name] = 0;
      }
      revenueByHealthPlan[r.health_plan.name] += r.amount;
    });

  // Cálculos finais
  const tax = expenseByCategory[EXPENSE_CATEGORIES.TAX] || 0;
  const operationalCosts = totalExpenses - tax; // Todos custos exceto imposto
  const netProfit = totalRevenue - totalExpenses;

  return {
    // Indicadores principais
    gross_revenue: totalRevenue,
    tax,
    operational_costs: operationalCosts,
    total_expenses: totalExpenses,
    net_profit: netProfit,
    margin:
      totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0,

    // Detalhes
    revenue_by_source: revenueBySource,
    revenue_by_health_plan: revenueByHealthPlan,
    expense_by_category: expenseByCategory,

    // Contadores
    revenue_count: revenues.length,
    expense_count: expenses.length,
  };
}

// ============ HEALTH PLANS ============

export async function createHealthPlan(data) {
  validateRequired(data.name, "Name");

  return await prisma.healthPlan.create({
    data: {
      name: data.name.trim(),
    },
  });
}

export async function getHealthPlans() {
  return await prisma.healthPlan.findMany({
    include: {
      revenue: true,
    },
  });
}

export async function deleteHealthPlan(id) {
  // Verificar se o plano existe e se tem revenues associadas
  const plan = await prisma.healthPlan.findUnique({
    where: { id: parseInt(id) },
    include: {
      revenue: true,
    },
  });

  if (!plan) {
    throw new Error("Plano de saúde não encontrado");
  }

  // Não permitir exclusão se houver revenues associadas
  if (plan.revenue && plan.revenue.length > 0) {
    throw new Error(
      `Não é possível excluir o plano "${plan.name}" pois existem ${plan.revenue.length} receita(s) associada(s). Remova as receitas primeiro.`,
    );
  }

  // Excluir o plano
  return await prisma.healthPlan.delete({
    where: { id: parseInt(id) },
  });
}

export async function getHealthPlanRevenue(name) {
  const hplan = await prisma.healthPlan.findUnique({
    where: { name },
    include: {
      revenue: true,
    },
  });

  if (!hplan) {
    throw new Error("Health plan not found");
  }

  const totalRevenue = hplan.revenue.reduce((sum, r) => sum + r.amount, 0);
  return {
    name: hplan.name,
    total_revenue: totalRevenue,
    transactions: hplan.revenue.length,
  };
}

// Manter compatibilidade com código antigo
export const FINANCE_TYPE = {
  ENTRADA: "entrada",
  SAIDA: "saida",
};

export async function createTransaction(data) {
  validateRequired(data.type, "Type");
  validateRequired(data.category, "Category");
  validateRequired(data.amount, "Amount");

  const validTypes = Object.values(FINANCE_TYPE);
  if (!validTypes.includes(data.type)) {
    throw new Error(`Invalid type. Must be one of: ${validTypes.join(", ")}`);
  }

  if (data.amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  return await prisma.finance.create({
    data: {
      type: data.type,
      category: data.category.trim(),
      amount: parseFloat(data.amount),
    },
  });
}

export async function getSummary() {
  const currentYear = new Date().getFullYear();
  const dateFrom = new Date(currentYear, 0, 1); // 1º de janeiro do ano atual
  const dateTo = new Date(); // Hoje

  const revenus = await prisma.revenue.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      date: {
        gte: dateFrom,
        lte: dateTo,
      },
    },
  });

  const expenses = await prisma.expense.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      date: {
        gte: dateFrom,
        lte: dateTo,
      },
    },
  });

  const receita = revenus._sum.amount || 0;
  const despesa = expenses._sum.amount || 0;
  const total = receita - despesa;

  return {
    receita,
    despesa,
    total,
    lucro_liquido: total,
  };
}

export async function getTransactions() {
  return await prisma.finance.findMany({
    orderBy: {
      date: "desc",
    },
  });
}

export async function deleteTransaction(id) {
  const transactionId = validateNumberId(id);

  return await prisma.finance.delete({
    where: { id: transactionId },
  });
}
