import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, TrendingUp, TrendingDown, Wallet, 
  Trash2, X, IndianRupee, Calendar, 
  Utensils, Home, Car, ShoppingBag, Zap, Briefcase, Heart, MoreHorizontal,
  ChevronLeft, ChevronRight, PieChart as PieChartIcon, Receipt, Target, ArrowRight
} from 'lucide-react';
import { formatINR } from '../utils/formatCurrency';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const CATEGORY_MAP = {
  food: { icon: <Utensils className="w-4 h-4" />, color: '#f59e0b' },
  rent: { icon: <Home className="w-4 h-4" />, color: '#3b82f6' },
  transport: { icon: <Car className="w-4 h-4" />, color: '#8b5cf6' },
  shopping: { icon: <ShoppingBag className="w-4 h-4" />, color: '#ec4899' },
  utilities: { icon: <Zap className="w-4 h-4" />, color: '#10b981' },
  salary: { icon: <Briefcase className="w-4 h-4" />, color: '#10b981' },
  health: { icon: <Heart className="w-4 h-4" />, color: '#ef4444' },
  other: { icon: <MoreHorizontal className="w-4 h-4" />, color: '#6b7280' }
};

const getCategoryData = (catName) => {
  const key = catName.toLowerCase();
  return CATEGORY_MAP[key] || CATEGORY_MAP.other;
};

const BudgetTracker = () => {
  const [viewDate, setViewDate] = useState(new Date()); // For Month Navigation
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); // For Averages
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: 'food',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch ALL transactions to calculate historical average
      const allRes = await api.get('/budget');
      setAllTransactions(allRes.data.entries);

      // 2. Fetch specific month transactions for the list
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
      
      const monthRes = await api.get(`/budget?startDate=${startDate}&endDate=${endDate}`);
      setTransactions(monthRes.data.entries);
    } catch (error) {
      console.error("Failed to fetch budget data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [viewDate]);

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/budget', { ...formData, amount: Number(formData.amount) });
      setIsModalOpen(false);
      setFormData({ type: 'expense', amount: '', category: 'food', description: '', date: new Date().toISOString().split('T')[0] });
      fetchData(); // Refresh data
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/budget/${id}`);
      fetchData();
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  // --- CALCULATIONS ---
  
  // 1. Selected Month Summary
  const income = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const savings = income - expense;

  // 2. Average Monthly Spend (From All Transactions)
  const monthlyExpenseTotals = {};
  allTransactions.filter(t => t.type === 'expense').forEach(t => {
    const d = new Date(t.date);
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    monthlyExpenseTotals[monthKey] = (monthlyExpenseTotals[monthKey] || 0) + t.amount;
  });
  const totalActiveMonths = Object.keys(monthlyExpenseTotals).length;
  const totalExpenseAllTime = Object.values(monthlyExpenseTotals).reduce((a, b) => a + b, 0);
  const avgMonthlyExpense = totalActiveMonths > 0 ? totalExpenseAllTime / totalActiveMonths : 0;

  // 3. Pie Chart Data
  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});
  const pieData = Object.keys(expenseByCategory).map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: expenseByCategory[cat],
    color: getCategoryData(cat).color
  }));

  // 4. Mock Budget Limit (For Progress Bar) - Assuming user sets a target of 50% of income
  const budgetTarget = income > 0 ? income * 0.7 : 50000; // Default target if no income
  const budgetUsedPercent = Math.min(100, Math.round((expense / budgetTarget) * 100));

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header & Month Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="text-center min-w-[150px]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{monthName}</h2>
            <p className="text-xs text-gray-500 font-medium">Monthly Overview</p>
          </div>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-xl transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary-500/30 flex items-center gap-2 hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" /> Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-green-500" /></div>
            <p className="text-sm text-gray-500 font-medium">Income</p>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatINR(income)}</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center"><TrendingDown className="w-4 h-4 text-red-500" /></div>
            <p className="text-sm text-gray-500 font-medium">Expenses</p>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatINR(expense)}</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center"><Wallet className="w-4 h-4 text-primary-500" /></div>
            <p className="text-sm text-gray-500 font-medium">Net Savings</p>
          </div>
          <h3 className={`text-2xl font-bold ${savings >= 0 ? 'text-primary-500' : 'text-red-500'}`}>{formatINR(savings)}</h3>
        </motion.div>

        {/* Average Monthly Spend Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-purple-500 to-primary-600 p-5 rounded-2xl shadow-lg shadow-primary-500/20 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center"><PieChartIcon className="w-4 h-4 text-white" /></div>
            <p className="text-sm text-white/80 font-medium">Avg. Monthly Spend</p>
          </div>
          <h3 className="text-2xl font-bold">{formatINR(avgMonthlyExpense)}</h3>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Charts & Progress */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Spending Breakdown</h2>
            {pieData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip formatter={(value) => formatINR(value)} contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1f2937', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No expenses this month</div>
            )}
          </motion.div>

          {/* Budget Target Progress */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Budget Goal</h2>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Used: {formatINR(expense)}</span>
              <span className="font-bold text-gray-900 dark:text-white">Target: {formatINR(budgetTarget)}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-dark-bg rounded-full h-3 mb-2">
              <div className={`h-3 rounded-full transition-all duration-1000 ${budgetUsedPercent > 90 ? 'bg-red-500' : budgetUsedPercent > 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${budgetUsedPercent}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 text-right">{budgetUsedPercent}% used</p>
          </motion.div>
        </div>

        {/* Right: Recent Transactions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-2 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden flex flex-col h-[520px]">
          <div className="p-6 border-b border-gray-100 dark:border-dark-border flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Transactions</h2>
            <span className="text-xs font-semibold bg-gray-100 dark:bg-dark-bg px-2 py-1 rounded-full">{transactions.length} items</span>
          </div>
          
          {loading ? (
            <div className="flex-1 flex justify-center items-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>
          ) : transactions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <Receipt className="w-12 h-12 mb-3 opacity-30" />
              <p>No transactions for {monthName}.</p>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {transactions.map((t) => {
                const catData = getCategoryData(t.category);
                return (
                  <div key={t._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors border-b border-gray-50 dark:border-dark-border/50 last:border-0 group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${catData.color}15`, color: catData.color }}>
                        {catData.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white capitalize text-sm">{t.category}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} {t.description && `• ${t.description}`}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-sm ${t.type === 'income' ? 'text-green-500' : 'text-gray-900 dark:text-white'}`}>
                        {t.type === 'income' ? '+' : '-'} {formatINR(t.amount)}
                      </span>
                      <button onClick={() => handleDelete(t._id)} className="text-gray-300 hover:text-red-500 transition-colors p-2 opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Transaction Modal (Same as before, clean and working) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-card rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 dark:border-dark-border flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Transaction</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><X className="w-6 h-6"/></button>
              </div>
              
              <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-dark-bg rounded-xl mb-2">
                  <button type="button" onClick={() => setFormData({...formData, type: 'income', category: 'salary'})} 
                    className={`py-2 rounded-lg text-sm font-semibold transition-all ${formData.type === 'income' ? 'bg-white dark:bg-dark-card text-green-500 shadow-sm' : 'text-gray-500'}`}>Income</button>
                  <button type="button" onClick={() => setFormData({...formData, type: 'expense', category: 'food'})} 
                    className={`py-2 rounded-lg text-sm font-semibold transition-all ${formData.type === 'expense' ? 'bg-white dark:bg-dark-card text-red-500 shadow-sm' : 'text-gray-500'}`}>Expense</button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label>
                  <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-semibold" placeholder="5000" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.keys(CATEGORY_MAP).map((catKey) => {
                      const isSelected = formData.category === catKey;
                      const catData = getCategoryData(catKey);
                      return (
                        <button key={catKey} type="button" onClick={() => setFormData({...formData, category: catKey})}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-100 dark:border-dark-border hover:border-gray-300'}`}
                        >
                          <div style={{ color: catData.color }} className="mb-1">{catData.icon}</div>
                          <span className="text-[10px] font-medium capitalize text-gray-600 dark:text-gray-400">{catKey}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                  <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Notes..." />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-colors mt-2">
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BudgetTracker;