import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { 
  AlertCircle, Sparkles, BrainCircuit, Target, Info, 
  CheckCircle2, Landmark, ShieldCheck, TrendingUp
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer 
} from 'recharts';

const COLORS = { 
  green: '#10b981', 
  blue: '#3b82f6', 
  yellow: '#eab308', 
  red: '#ef4444'
};

const InfoTooltip = ({ text }) => (
  <div className="group relative inline-block ml-2 cursor-help">
    <Info className="w-4 h-4 text-gray-400 hover:text-primary-500 transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-gray-900 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-2xl pointer-events-none leading-relaxed">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
);

const CreditScore = () => {
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  
  const [formData, setFormData] = useState({
    onTimePaymentPercentage: 100,
    creditUtilizationPercentage: 20,
    creditHistoryMonths: 24,
    hasCreditCard: true,
    hasActiveLoan: false,
    recentInquiries: 0
  });

  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/credit');
        setResult({
          scoreData: { 
            score: res.data.profile.calculatedScore,
            grade: res.data.profile.calculatedScore >= 750 ? 'Excellent' : res.data.profile.calculatedScore >= 700 ? 'Good' : res.data.profile.calculatedScore >= 650 ? 'Fair' : 'Poor',
            color: res.data.profile.calculatedScore >= 750 ? 'green' : res.data.profile.calculatedScore >= 700 ? 'blue' : res.data.profile.calculatedScore >= 650 ? 'yellow' : 'red',
            breakdown: { paymentHistory: 315, utilization: 270, historyLength: 135, creditMix: 90, inquiries: 90 }
          },
          aiAdvice: null,
          profile: res.data.profile
        });
        setFormData({
          onTimePaymentPercentage: res.data.profile.onTimePaymentPercentage,
          creditUtilizationPercentage: res.data.profile.creditUtilizationPercentage,
          creditHistoryMonths: res.data.profile.creditHistoryMonths,
          hasCreditCard: res.data.profile.hasCreditCard,
          hasActiveLoan: res.data.profile.hasActiveLoan,
          recentInquiries: res.data.profile.recentInquiries
        });
      } catch (error) {
        // No profile exists yet
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setCalculating(true);
    try {
      const res = await api.post('/credit/calculate', formData);
      setResult(res.data);
    } catch (error) {
      alert("Failed to calculate score.");
    } finally {
      setCalculating(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : Number(value)
    });
  };

  const score = result?.scoreData?.score || 0;
  const color = result?.scoreData?.color || 'red';
  const activeColor = COLORS[color];
  
  // Gauge Data Setup
  // Background track uses 100% value
  const bgData = [{ value: 1 }];
  // Foreground uses score out of 900
  const scoreData = [
    { value: score / 900 },
    { value: (900 - score) / 900 }
  ];

  const getScoreImpact = (score) => {
    if (score >= 750) return { title: "Excellent", text: "Banks will offer you the lowest interest rates and instant loan approvals.", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" };
    if (score >= 700) return { title: "Good", text: "You will easily get loans, but you might pay slightly higher interest than the best rates.", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" };
    if (score >= 650) return { title: "Fair (Minimum Required)", text: "You can get loans, but banks will charge high interest. Try to reach 750+ for better rates.", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" };
    return { title: "Poor (High Risk)", text: "Most banks will reject your loan application. Focus on paying bills on time to recover.", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" };
  };
  const impact = getScoreImpact(score);

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-primary-500" /> Credit Score Simulator
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Simulate your score and see how it impacts your loan eligibility.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Form (Takes 5 columns) */}
        <div className="lg:col-span-5 bg-white dark:bg-dark-card p-6 rounded-3xl border border-gray-100 dark:border-dark-border shadow-xl shadow-gray-200/20 dark:shadow-none">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-500" /> Your Financial Habits
          </h2>
          
          <form onSubmit={handleCalculate} className="space-y-4">
            
            {/* 1. On-Time Payment */}
            <div className="bg-gray-50/50 dark:bg-dark-bg/50 p-4 rounded-2xl border border-gray-100 dark:border-dark-border/50 hover:border-primary-500/30 transition-colors">
              <label className="flex justify-between items-center text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                <span className="flex items-center">
                  On-Time Payment %
                  <InfoTooltip text="Out of all your past EMIs and bills, what % did you pay on time? (Ideal: 100%)" />
                </span>
                <span className={`px-2.5 py-1 rounded-lg ${formData.onTimePaymentPercentage < 80 ? 'text-red-500 bg-red-500/10' : 'text-green-500 bg-green-500/10'}`}>
                  {formData.onTimePaymentPercentage}%
                </span>
              </label>
              <input type="range" name="onTimePaymentPercentage" min="0" max="100" step="5" value={formData.onTimePaymentPercentage} onChange={handleChange} className="w-full accent-primary-600" />
            </div>

            {/* 2. Credit Utilization */}
            <div className="bg-gray-50/50 dark:bg-dark-bg/50 p-4 rounded-2xl border border-gray-100 dark:border-dark-border/50 hover:border-primary-500/30 transition-colors">
              <label className="flex justify-between items-center text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                <span className="flex items-center">
                  Credit Utilization %
                  <InfoTooltip text="How much of your card limit do you use? If limit is ₹1L and you spend ₹40k, it's 40%. (Ideal: Under 30%)" />
                </span>
                <span className="text-primary-600 bg-primary-500/10 px-2.5 py-1 rounded-lg">{formData.creditUtilizationPercentage}%</span>
              </label>
              <input type="range" name="creditUtilizationPercentage" min="0" max="100" step="5" value={formData.creditUtilizationPercentage} onChange={handleChange} className="w-full accent-primary-600" />
            </div>

            {/* 3. Credit History */}
            <div className="bg-gray-50/50 dark:bg-dark-bg/50 p-4 rounded-2xl border border-gray-100 dark:border-dark-border/50 hover:border-primary-500/30 transition-colors">
              <label className="flex justify-between items-center text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                <span className="flex items-center">
                  Oldest Account Age
                  <InfoTooltip text="How old is your oldest credit account? (Ideal: 5+ years)" />
                </span>
                <span className="text-primary-600 bg-primary-500/10 px-2.5 py-1 rounded-lg">{formData.creditHistoryMonths} mo</span>
              </label>
              <input type="range" name="creditHistoryMonths" min="0" max="120" step="6" value={formData.creditHistoryMonths} onChange={handleChange} className="w-full accent-primary-600" />
            </div>

            {/* 4. Credit Mix */}
            <div className="bg-gray-50/50 dark:bg-dark-bg/50 p-4 rounded-2xl border border-gray-100 dark:border-dark-border/50 hover:border-primary-500/30 transition-colors">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                Credit Mix
              </label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 cursor-pointer p-1">
                  <input type="checkbox" name="hasCreditCard" checked={formData.hasCreditCard} onChange={handleChange} className="w-5 h-5 text-primary-600 rounded" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">I use a Credit Card</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-1">
                  <input type="checkbox" name="hasActiveLoan" checked={formData.hasActiveLoan} onChange={handleChange} className="w-5 h-5 text-primary-600 rounded" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">I have an active Loan</span>
                </label>
              </div>
            </div>

            {/* 5. New Inquiries */}
            <div className="bg-gray-50/50 dark:bg-dark-bg/50 p-4 rounded-2xl border border-gray-100 dark:border-dark-border/50 hover:border-primary-500/30 transition-colors">
              <label className="flex justify-between items-center text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                <span className="flex items-center">
                  Recent Inquiries (Last 6 Mo)
                  <InfoTooltip text="How many times did you apply for new credit? Too many applications hurt your score. (Ideal: 0)" />
                </span>
                <span className="text-primary-600 bg-primary-500/10 px-2.5 py-1 rounded-lg">{formData.recentInquiries}</span>
              </label>
              <input type="range" name="recentInquiries" min="0" max="5" step="1" value={formData.recentInquiries} onChange={handleChange} className="w-full accent-primary-600" />
            </div>

            <button type="submit" disabled={calculating} className="w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary-500/30 flex justify-center items-center gap-2 mt-2">
              {calculating ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Sparkles className="w-5 h-5" />}
              {calculating ? 'Simulating...' : 'Calculate Score'}
            </button>
          </form>
        </div>

        {/* Right Column: Score Display & Impact (Takes 7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <>
              {/* Premium Gauge Chart Card */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} 
                className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border shadow-xl overflow-hidden relative"
              >
                <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-primary-500/10 to-transparent"></div>
                
                <div className="p-6 md:p-8 flex flex-col items-center relative z-10">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your Estimated Score</h2>
                  
                  {/* FIXED Gauge Chart */}
                  <div className="relative w-full max-w-[280px] h-[140px] mt-4 flex justify-center items-end">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        {/* Background Track (Grey) */}
                        <Pie 
                          data={bgData} cx="50%" cy="100%" 
                          startAngle={180} endAngle={0} 
                          innerRadius={75} outerRadius={105} 
                          stroke="none"
                        >
                          <Cell fill="currentColor" className="text-gray-100 dark:text-dark-bg" />
                        </Pie>
                        
                        {/* Score Fill */}
                        <Pie 
                          data={scoreData} cx="50%" cy="100%" 
                          startAngle={180} endAngle={0} 
                          innerRadius={75} outerRadius={105} 
                          paddingAngle={0} dataKey="value" stroke="none"
                        >
                          <Cell fill={activeColor} />
                          <Cell fill="transparent" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Center Score Text */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-2 w-full">
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-extrabold tracking-tight" style={{ color: activeColor }}>
                          {score}
                        </span>
                        <span className="text-gray-400 text-lg font-medium">/900</span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Horizontal Scale Indicator */}
                  <div className="w-full max-w-md mt-8">
                    <div className="flex justify-between text-[11px] font-bold text-gray-500 mb-2">
                      <span>300 (Poor)</span>
                      <span>650 (Fair)</span>
                      <span>750+ (Excellent)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-dark-bg relative overflow-hidden">
                      <div className="absolute h-full bg-red-500 w-[20%] rounded-l-full"></div>
                      <div className="absolute h-full bg-yellow-500 w-[30%] left-[20%]"></div>
                      <div className="absolute h-full bg-blue-500 w-[15%] left-[50%]"></div>
                      <div className="absolute h-full bg-green-500 w-[35%] left-[65%] rounded-r-full"></div>
                      
                      {/* Indicator Dot */}
                      <motion.div 
                        initial={{ left: 0 }} animate={{ left: `${Math.min(100, Math.max(0, ((score - 300) / 600) * 100))}%` }}
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-[3px] shadow-md rounded-full z-10"
                        style={{ borderColor: activeColor, transform: 'translate(-50%, -50%)' }}
                      ></motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Loan Impact & AI Advice Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Loan Impact */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-dark-card p-6 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-blue-500" /> Loan Impact
                    </h3>
                    <div className={`p-4 rounded-2xl border ${impact.bg} ${impact.border} mb-4`}>
                      <h4 className={`font-bold ${impact.color} mb-1 flex items-center gap-2`}>
                        {score >= 750 ? <CheckCircle2 className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
                        {impact.title}
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{impact.text}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm bg-gray-50 dark:bg-dark-bg p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> Minimum for any loan: <strong className="text-gray-900 dark:text-white">650</strong>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <TrendingUp className="w-4 h-4 text-green-500" /> Best interest rates: <strong className="text-gray-900 dark:text-white">750+</strong>
                    </div>
                  </div>
                </motion.div>

                {/* AI Action Plan */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-gradient-to-br from-gray-900 to-[#0B0F19] text-white p-6 rounded-3xl border border-gray-800 shadow-xl flex flex-col">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-purple-400" /> AI Action Plan
                  </h3>
                  <div className="flex-1 bg-black/30 rounded-xl p-4 border border-white/5">
                    {result.aiAdvice ? (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-300">
                        {result.aiAdvice}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 flex flex-col items-center justify-center h-full text-center">
                        <Sparkles className="w-8 h-8 mb-2 opacity-50" />
                        Click "Calculate Score" to get personalized AI tips.
                      </div>
                    )}
                  </div>
                </motion.div>

              </div>
            </>
          ) : (
             <div className="bg-white dark:bg-dark-card p-6 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col items-center justify-center h-full text-center text-gray-400 min-h-[400px]">
                <div className="w-20 h-20 bg-gray-50 dark:bg-dark-bg rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-10 h-10 opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Score Calculated</h3>
                <p className="max-w-xs">Fill out your financial habits on the left and click Simulate to see your credit score and AI advice.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditScore;