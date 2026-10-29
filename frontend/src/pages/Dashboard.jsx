import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  TrendingUp, TrendingDown, Wallet, 
  BrainCircuit, Target, ArrowRight, PieChart as PieChartIcon 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip 
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [aiInsight, setAiInsight] = useState('');
  const [aiLoading, setAiLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch dashboard", error);
        setLoading(false);
      }
    };
    fetchDashboard();

    const fetchAIInsight = async () => {
      try {
        const res = await api.get('/ai/insights');
        setAiInsight(res.data.insight);
      } catch (error) {
        setAiInsight('Could not load AI insights at this time.');
      } finally {
        setAiLoading(false);
      }
    };
    fetchAIInsight();
  }, []);

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
    </div>
  );

  const { budgetSummary, health, categoryBreakdown } = data;

  const statCards = [
    { title: "Total Income", value: `₹${budgetSummary.income.toLocaleString('en-IN')}`, icon: <TrendingUp className="w-5 h-5 text-green-500" />, bg: "bg-green-500/10" },
    { title: "Total Expenses", value: `₹${budgetSummary.expense.toLocaleString('en-IN')}`, icon: <TrendingDown className="w-5 h-5 text-red-500" />, bg: "bg-red-500/10" },
    { title: "Total Savings", value: `₹${budgetSummary.savings.toLocaleString('en-IN')}`, icon: <Wallet className="w-5 h-5 text-primary-500" />, bg: "bg-primary-500/10" },
    { title: "Savings Rate", value: `${budgetSummary.savingsRate}%`, icon: <Target className="w-5 h-5 text-purple-500" />, bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      
      {/* Welcome Banner (Compact) */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-bold mb-1">Hello, {user?.name}! 👋</h1>
          <p className="text-primary-100 text-sm">Here is your financial overview for this month.</p>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
      </motion.div>

      {/* Stats Grid (Compact) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-dark-card p-4 rounded-xl border border-gray-100 dark:border-dark-border shadow-sm flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg} shrink-0`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-0.5">{stat.title}</p>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (Insight & Chart) */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* AI Insight */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-white dark:bg-dark-card p-4 sm:p-5 rounded-xl border border-primary-500/20 dark:border-primary-500/30 relative overflow-hidden shadow-sm"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
            <div className="flex items-start gap-3">
              <div className="bg-primary-500/10 p-2.5 rounded-lg shrink-0 mt-0.5">
                <BrainCircuit className="w-5 h-5 text-primary-500" />
              </div>
              <div className="flex-1 w-full">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">AI Financial Insight</h3>
                
                {aiLoading ? (
                  <div className="space-y-2 animate-pulse mt-3">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 text-sm leading-relaxed prose-li:my-0.5 prose-ul:my-1">
                    {aiInsight && aiInsight.trim() !== '' ? (
                      <ReactMarkdown>{aiInsight}</ReactMarkdown>
                    ) : (
                      <p className="text-gray-500 italic text-sm">No insights available right now.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Expense Breakdown */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="bg-white dark:bg-dark-card p-4 sm:p-5 rounded-xl border border-gray-100 dark:border-dark-border shadow-sm"
          >
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Expense Breakdown</h3>
            {categoryBreakdown && categoryBreakdown.length > 0 ? (
              <div className="h-52 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="total"
                      nameKey="category"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => `₹${value}`}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-52 flex flex-col items-center justify-center text-gray-400">
                <PieChartIcon className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No expense data available.</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column (Health Score) */}
        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-white dark:bg-dark-card p-4 sm:p-5 rounded-xl border border-gray-100 dark:border-dark-border shadow-sm h-full flex flex-col"
          >
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Financial Health</h3>
            
            <div className="flex flex-col items-center justify-center mb-4 flex-1">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100 dark:text-dark-border" />
                  <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="6" fill="transparent" 
                    strokeDasharray={263.89} 
                    strokeDashoffset={263.89 - (263.89 * (health?.score || 0)) / 100}
                    className={`transition-all duration-1000 ease-out ${
                      (health?.score || 0) >= 80 ? 'text-green-500' : 
                      (health?.score || 0) >= 60 ? 'text-primary-500' : 'text-red-500'
                    }`} 
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{health?.score || 0}</span>
                  <span className="text-[10px] text-gray-500 font-medium">/ 100</span>
                </div>
              </div>
              <span className={`mt-3 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                (health?.score || 0) >= 80 ? 'bg-green-500/10 text-green-500' : 
                (health?.score || 0) >= 60 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {health?.grade || 'N/A'}
              </span>
            </div>

            <div className="space-y-2 mt-auto">
              {(health?.tips || []).slice(0, 2).map((tip, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <ArrowRight className="w-3.5 h-3.5 text-primary-500 mt-0.5 shrink-0" />
                  <p className="leading-snug">{tip}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;