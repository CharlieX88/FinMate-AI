import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, SlidersHorizontal, Sparkles, Building2, 
  Percent, ArrowRight, BrainCircuit, X, CheckCircle2, 
  ShieldCheck, Trophy, TrendingDown, Wallet, Zap 
} from 'lucide-react';
import { formatINR, calculateEMI } from '../utils/formatCurrency';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend 
} from 'recharts';

const LoanExplorer = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const [desiredAmount, setDesiredAmount] = useState(500000); 
  const [desiredTenure, setDesiredTenure] = useState(60); 
  const [extraPayment, setExtraPayment] = useState(0); 

  const [selectedLoan, setSelectedLoan] = useState(null); 
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);

  const loanTypes = ['all', 'personal', 'home', 'car', 'education', 'business'];

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const res = await api.get('/loans');
        setLoans(res.data.loans);
      } catch (error) {
        console.error("Failed to fetch loans", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, []);

  const handleAnalyzeScenario = async () => {
    setAiAnalysisLoading(true);
    setAiAnalysis(null);
    try {
      const res = await api.post('/ai/simulate-loan', {
        requestedAmount: desiredAmount,
        preferredTenure: desiredTenure
      });
      setAiAnalysis(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "AI Analysis failed.");
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  const handleApplyOptimal = () => {
    if (aiAnalysis?.optimalTenure) {
      setDesiredTenure(aiAnalysis.optimalTenure);
      setSelectedLoan(null); 
      setAiAnalysis(null);
    }
  };

  const baseEMI = selectedLoan ? calculateEMI(desiredAmount, selectedLoan.interestRate, desiredTenure) : 0;
  
  const calculateSimulatedTenure = () => {
    if (!selectedLoan || extraPayment === 0) return desiredTenure;
    const r = selectedLoan.interestRate / 12 / 100;
    const P = desiredAmount;
    const E = baseEMI + extraPayment;
    if (E <= P * r) return desiredTenure; 
    const n = -Math.log(1 - (P * r) / E) / Math.log(1 + r);
    return Math.ceil(n);
  };

  const newTenure = calculateSimulatedTenure();
  const monthsSaved = desiredTenure - newTenure;
  
  const totalInterestBase = (baseEMI * desiredTenure) - desiredAmount;
  const totalInterestNew = ((baseEMI + extraPayment) * newTenure) - desiredAmount;
  const interestSaved = totalInterestBase - totalInterestNew;

  const generateGraphData = () => {
    if (!selectedLoan) return [];
    let data = [];
    let balanceBase = desiredAmount;
    let balanceNew = desiredAmount;
    const r = selectedLoan.interestRate / 12 / 100;
    
    for (let i = 0; i <= desiredTenure; i++) {
      if (i % 6 === 0 || i === desiredTenure || i === newTenure) {
        data.push({
          month: `Mo ${i}`,
          'Base Balance': Math.max(0, Math.round(balanceBase)),
          'With Prepayment': Math.max(0, Math.round(balanceNew)),
        });
      }
      const interestBase = balanceBase * r;
      balanceBase = balanceBase + interestBase - baseEMI;
      const interestNew = balanceNew * r;
      balanceNew = balanceNew + interestNew - (baseEMI + extraPayment);
      if (balanceNew < 0) balanceNew = 0;
    }
    return data;
  };

  const graphData = generateGraphData();

  return (
    <div className="space-y-8 pb-10 relative">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Loan Explorer & Simulator</h1>
        <p className="text-gray-500 dark:text-gray-400">Find the perfect loan and simulate how to pay it off faster.</p>
      </div>

      <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm space-y-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Desired Loan Amount</label>
              <span className="text-primary-600 font-bold">{formatINR(desiredAmount)}</span>
            </div>
            <input type="range" min="50000" max="10000000" step="50000" value={desiredAmount} onChange={(e) => setDesiredAmount(Number(e.target.value))} className="w-full accent-primary-600" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Desired Tenure (Months)</label>
              <span className="text-primary-600 font-bold">{desiredTenure} Months ({(desiredTenure/12).toFixed(1)} Yrs)</span>
            </div>
            <input type="range" min="12" max="360" step="12" value={desiredTenure} onChange={(e) => setDesiredTenure(Number(e.target.value))} className="w-full accent-primary-600" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100 dark:border-dark-border items-center justify-between">
          <p className="text-sm text-gray-500">Let AI analyze if your selected tenure is a trap.</p>
          <button onClick={handleAnalyzeScenario} disabled={aiAnalysisLoading} className="bg-gradient-to-r from-purple-600 to-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-purple-500/30 flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-70">
            {aiAnalysisLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <BrainCircuit className="w-5 h-5" />}
            {aiAnalysisLoading ? 'Analyzing...' : 'Ask AI: Best Bank & Reality Check'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {aiAnalysis && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-gradient-to-br from-gray-900 to-dark-bg text-white p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl border border-gray-800">
            <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck className="w-32 h-32" /></div>
            <button onClick={() => setAiAnalysis(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="w-6 h-6 text-yellow-400"/>
              <h3 className="text-xl font-bold">AI Recommended Bank: <span className="text-primary-400">{aiAnalysis.bestLoan.loan.bankName}</span></h3>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                <p className="text-gray-400 text-xs mb-1">Current EMI</p>
                <p className="text-xl font-bold text-green-400">₹{aiAnalysis.summary.emi.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                <p className="text-gray-400 text-xs mb-1">Total Interest Paid</p>
                <p className="text-xl font-bold text-red-400">₹{aiAnalysis.summary.totalInterest.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                <p className="text-gray-400 text-xs mb-1">Total Repayment</p>
                <p className="text-xl font-bold text-white">₹{aiAnalysis.summary.totalPayable.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="bg-black/30 p-5 rounded-2xl border border-white/10">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-400" /> AI Reality Check
              </h4>
              <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-medium mb-4">
                {aiAnalysis.aiExplanation}
              </div>
              
              {aiAnalysis.optimalTenure && (
                <button onClick={handleApplyOptimal} className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-600 transition-colors">
                  <Zap className="w-4 h-4" /> Apply AI Suggested Tenure ({aiAnalysis.optimalTenure} Months)
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loans Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.filter(l => (selectedType === 'all' || l.loanType === selectedType) && desiredAmount <= l.maxAmount).map((loan, idx) => {
            const estimatedEMI = calculateEMI(desiredAmount, loan.interestRate, desiredTenure);
            return (
              <motion.div key={loan._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-100 dark:border-dark-border hover:shadow-lg transition-shadow group flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-dark-bg rounded-lg flex items-center justify-center text-gray-500"><Building2 className="w-5 h-5" /></div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{loan.bankName}</h3>
                      <p className="text-xs text-primary-500 font-semibold uppercase tracking-wider">{loan.loanType}</p>
                    </div>
                  </div>
                  <div className="bg-primary-500/10 text-primary-600 dark:text-primary-400 px-2 py-1 rounded text-sm font-bold flex items-center gap-1"><Percent className="w-3 h-3" /> {loan.interestRate}</div>
                </div>
                <div className="bg-gray-50 dark:bg-dark-bg p-3 rounded-xl mb-4 border border-gray-100 dark:border-dark-border mt-auto">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Estimated EMI</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">₹{estimatedEMI.toLocaleString('en-IN')} <span className="text-sm font-normal text-gray-500">/mo</span></p>
                </div>
                
                {/* Single Wide Button */}
                <button onClick={() => { setSelectedLoan({ ...loan, estimatedEMI }); setExtraPayment(0); }} className="w-full py-2.5 rounded-xl border-2 border-primary-500/20 text-primary-600 dark:text-primary-400 font-semibold group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all flex items-center justify-center gap-2">
                  Simulate & View Details <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* SIMULATOR MODAL */}
      <AnimatePresence>
        {selectedLoan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-dark-card rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-gray-100 dark:border-dark-border my-8">
              <div className="bg-primary-600 p-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{selectedLoan.bankName} Simulator</h2>
                  <p className="text-primary-100 uppercase tracking-widest text-sm font-semibold">{formatINR(desiredAmount)} @ {selectedLoan.interestRate}%</p>
                </div>
                <button onClick={() => setSelectedLoan(null)} className="text-white/70 hover:text-white bg-white/10 p-2 rounded-full"><X className="w-6 h-6"/></button>
              </div>
              <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-dark-bg p-5 rounded-2xl border border-gray-100 dark:border-dark-border">
                    <p className="text-sm text-gray-500 mb-1">Base Monthly EMI</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{baseEMI.toLocaleString('en-IN')}</p>
                    <p className="text-sm text-gray-500 mt-2">for {desiredTenure} months</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-primary-500" />
                      Add Extra Monthly Payment (Prepayment)
                    </label>
                    <input type="range" min="0" max={baseEMI} step="500" value={extraPayment} onChange={(e) => setExtraPayment(Number(e.target.value))} className="w-full accent-primary-600" />
                    <div className="flex justify-between text-sm mt-1 text-gray-500">
                      <span>₹0</span>
                      <span className="font-bold text-primary-600">₹{extraPayment.toLocaleString('en-IN')} / mo</span>
                    </div>
                  </div>
                  {extraPayment > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-500/10 border border-green-500/20 p-5 rounded-2xl">
                      <h4 className="font-bold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                        <TrendingDown className="w-5 h-5" /> The Power of Prepayment
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">New Tenure</span>
                          <span className="font-bold text-gray-900 dark:text-white">{newTenure} Months <span className="text-xs text-gray-500">(was {desiredTenure})</span></span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Time Saved</span>
                          <span className="font-bold text-green-500">{monthsSaved} Months Earlier!</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Interest Saved</span>
                          <span className="font-bold text-green-500">₹{Math.round(interestSaved).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
                <div className="bg-gray-50 dark:bg-dark-bg p-5 rounded-2xl border border-gray-100 dark:border-dark-border flex flex-col">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4">Debt Reduction Graph</h4>
                  <div className="h-64 flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={graphData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                        <XAxis dataKey="month" tick={{fontSize: 12, fill: '#6b7280'}} />
                        <YAxis tickFormatter={(val) => `₹${val/100000}L`} tick={{fontSize: 12, fill: '#6b7280'}} />
                        <RechartsTooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1f2937', color: '#fff' }} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Area type="monotone" dataKey="Base Balance" stroke="#ef4444" fillOpacity={1} fill="url(#colorBase)" />
                        {extraPayment > 0 && <Area type="monotone" dataKey="With Prepayment" stroke="#10b981" fillOpacity={1} fill="url(#colorNew)" />}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">See how fast your debt drops to zero with extra payments.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoanExplorer;