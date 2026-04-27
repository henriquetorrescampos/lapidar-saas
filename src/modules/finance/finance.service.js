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
  const dateWhere = {};
  if (filters.date_from || filters.date_to) {
    if (filters.date_from) dateWhere.gte = new Date(filters.date_from);
    if (filters.date_to) dateWhere.lte = new Date(filters.date_to);
  }

  const revenueWhere = { ...(Object.keys(dateWhere).length && { date: dateWhere }) };
  if (filters.source) revenueWhere.source = filters.source;
  if (filters.health_plan_id) revenueWhere.health_plan_id = parseInt(filters.health_plan_id);

  const expenseWhere = { ...(Object.keys(dateWhere).length && { date: dateWhere }) };
  if (filters.category) expenseWhere.category = filters.category;

  const [
    revenueBySourceRaw,
    revenueByHealthPlanRaw,
    expenseByCategoryRaw,
    revenueCounts,
    expenseCounts,
  ] = await Promise.all([
    // Soma por fonte
    prisma.revenue.groupBy({
      by: ["source"],
      _sum: { amount: true },
      _count: { id: true },
      where: revenueWhere,
    }),
    // Soma por plano de saúde
    prisma.revenue.groupBy({
      by: ["health_plan_id"],
      _sum: { amount: true },
      where: { ...revenueWhere, source: REVENUE_SOURCES.HEALTH_PLAN, health_plan_id: { not: null } },
    }),
    // Soma por categoria de despesa
    prisma.expense.groupBy({
      by: ["category"],
      _sum: { amount: true },
      _count: { id: true },
      where: expenseWhere,
    }),
    prisma.revenue.count({ where: revenueWhere }),
    prisma.expense.count({ where: expenseWhere }),
  ]);

  // Busca nomes dos planos para o agrupamento de receita por plano
  const healthPlanIds = revenueByHealthPlanRaw
    .map((r) => r.health_plan_id)
    .filter(Boolean);
  const healthPlans =
    healthPlanIds.length > 0
      ? await prisma.healthPlan.findMany({
          where: { id: { in: healthPlanIds } },
          select: { id: true, name: true },
        })
      : [];
  const healthPlanMap = Object.fromEntries(healthPlans.map((hp) => [hp.id, hp.name]));

  // Montar objetos de resultado
  const revenueBySource = {
    health_plan: 0,
    particular: 0,
  };
  let totalRevenue = 0;
  for (const row of revenueBySourceRaw) {
    const amount = row._sum.amount || 0;
    revenueBySource[row.source] = amount;
    totalRevenue += amount;
  }

  const revenueByHealthPlan = {};
  for (const row of revenueByHealthPlanRaw) {
    const name = healthPlanMap[row.health_plan_id];
    if (name) revenueByHealthPlan[name] = row._sum.amount || 0;
  }

  const expenseByCategory = {};
  Object.values(EXPENSE_CATEGORIES).forEach((cat) => { expenseByCategory[cat] = 0; });
  let totalExpenses = 0;
  for (const row of expenseByCategoryRaw) {
    const amount = row._sum.amount || 0;
    expenseByCategory[row.category] = amount;
    totalExpenses += amount;
  }

  const tax = expenseByCategory[EXPENSE_CATEGORIES.TAX] || 0;
  const operationalCosts = totalExpenses - tax;
  const netProfit = totalRevenue - totalExpenses;

  return {
    gross_revenue: totalRevenue,
    tax,
    operational_costs: operationalCosts,
    total_expenses: totalExpenses,
    net_profit: netProfit,
    margin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0,
    revenue_by_source: revenueBySource,
    revenue_by_health_plan: revenueByHealthPlan,
    expense_by_category: expenseByCategory,
    revenue_count: revenueCounts,
    expense_count: expenseCounts,
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
