import {
  createRevenue,
  getRevenues,
  getRevenueByHealthPlan,
  deleteRevenue,
  createExpense,
  getExpenses,
  getExpenseByCategory,
  deleteExpense,
  getFinancialDashboard,
  createHealthPlan,
  getHealthPlans,
  deleteHealthPlan,
  createTransaction,
  getSummary,
  getTransactions,
  deleteTransaction,
} from "./finance.service.js";

// ============ RECEITAS ============

export async function createRevenueController(req, res) {
  try {
    const revenue = await createRevenue(req.body);
    res.status(201).json(revenue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getRevenuesController(req, res) {
  try {
    const revenues = await getRevenues(req.query);
    res.json(revenues);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getRevenueByHealthPlanController(req, res) {
  try {
    const data = await getRevenueByHealthPlan();
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteRevenueController(req, res) {
  try {
    await deleteRevenue(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// ============ DESPESAS ============

export async function createExpenseController(req, res) {
  try {
    const expense = await createExpense(req.body);
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getExpensesController(req, res) {
  try {
    const expenses = await getExpenses(req.query);
    res.json(expenses);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getExpenseByCategoryController(req, res) {
  try {
    const data = await getExpenseByCategory();
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteExpenseController(req, res) {
  try {
    await deleteExpense(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// ============ DASHBOARD ============

export async function getDashboardController(req, res) {
  try {
    const dashboard = await getFinancialDashboard(req.query);
    res.json(dashboard);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// ============ HEALTH PLANS ============

export async function createHealthPlanController(req, res) {
  try {
    const plan = await createHealthPlan(req.body);
    res.status(201).json(plan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getHealthPlansController(req, res) {
  try {
    const plans = await getHealthPlans();
    res.json(plans);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteHealthPlanController(req, res) {
  try {
    await deleteHealthPlan(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// ============ LEGACY (compatibilidade) ============

// CREATE
export async function createTransactionController(req, res) {
  try {
    const transaction = await createTransaction(req.body);
    res.json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// SUMMARY
export async function getSummaryController(req, res) {
  try {
    const summary = await getSummary();
    res.json(summary);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// LISTAR
export async function getTransactionsController(req, res) {
  try {
    const transactions = await getTransactions();
    res.json(transactions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// DELETE
export async function deleteTransactionController(req, res) {
  try {
    await deleteTransaction(req.params.id);
    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
