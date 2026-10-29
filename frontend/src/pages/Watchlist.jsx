import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, ArrowRight, Percent, Building2, 
  Scale, X, CheckCircle2, TrendingDown
} from 'lucide-react';
import { formatINR } from '../utils/formatCurrency';

const Watchlist = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Compare State
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [compareResult, setCompareResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);

  const fetchWatchlist = async () => {
    try {
      const res = await api.get('/watchlist');
      setItems(res.data.items);
    } catch (error) {
      console.error("Failed to fetch watchlist", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this loan from watchlist?")) return;
    try {
      await api.delete(`/watchlist/${id}`);
      setItems(items.filter(item => item._id !== id));
      setSelectedForCompare(selectedForCompare.filter(sid => sid !== id));
    } catch (error) {
      alert("Failed to remove.");
    }
  };

  const toggleCompare = (id) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter(sid => sid !== id));
    } else {
      if (selectedForCompare.length >= 3) {
        alert("You can compare maximum 3 loans at a time.");
        return;
      }
      setSelectedForCompare([...selectedForCompare, id]);
    }
  };

  const handleCompare = async () => {
    if (selectedForCompare.length < 2) return;
    setIsComparing(true);
    try {
      const res = await api.post('/watchlist/compare', { ids: selectedForCompare });
      setCompareResult(res.data);
    } catch (error) {
      alert("Failed to compare loans.");
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-8 pb-10 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Saved Loans</h1>
          <p className="text-gray-500 dark:text-gray-400">Keep track of your favorite loans and compare them.</p>
        </div>
        
        {selectedForCompare.length > 0 && (
          <button 
            onClick={handleCompare}
            disabled={isComparing || selectedForCompare.length < 2}
            className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary-500/30 flex items-center gap-2 hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {isComparing ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Scale className="w-5 h-5" />}
            Compare ({selectedForCompare.length})
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border">
          <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Saved Loans</h3>
          <p className="text-gray-500 mb-6">You haven't saved any loans yet. Explore loans and save the best ones.</p>
          <button onClick={() => navigate('/loans')} className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors">
            Explore Loans
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <motion.div 
              key={item._id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              className={`bg-white dark:bg-dark-card p-6 rounded-2xl border transition-all ${
                selectedForCompare.includes(item._id) 
                  ? 'border-primary-500 ring-2 ring-primary-500/20' 
                  : 'border-gray-100 dark:border-dark-border'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-dark-bg rounded-lg flex items-center justify-center text-gray-500"><Building2 className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{item.loan.bankName}</h3>
                    <p className="text-xs text-primary-500 font-semibold uppercase tracking-wider">{item.loan.loanType}</p>
                  </div>
                </div>
                <div className="bg-primary-500/10 text-primary-600 px-2 py-1 rounded text-sm font-bold flex items-center gap-1">
                  <Percent className="w-3 h-3" /> {item.loan.interestRate}
                </div>
              </div>

              {item.previewEMI && (
                <div className="bg-green-50 dark:bg-green-500/10 p-3 rounded-xl mb-4 border border-green-100 dark:border-green-500/20 text-center">
                  <p className="text-xs text-green-700 dark:text-green-400 mb-1">Estimated EMI</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-500">₹{item.previewEMI.toLocaleString('en-IN')} <span className="text-sm font-normal">/mo</span></p>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => toggleCompare(item._id)}
                  className={`flex-1 py-2 rounded-lg font-semibold border-2 flex items-center justify-center gap-2 transition-all text-sm ${
                    selectedForCompare.includes(item._id)
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:border-primary-500 hover:text-primary-500'
                  }`}
                >
                  {selectedForCompare.includes(item._id) ? <CheckCircle2 className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
                  {selectedForCompare.includes(item._id) ? 'Selected' : 'Compare'}
                </button>
                <button 
                  onClick={() => handleRemove(item._id)}
                  className="px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-dark-border text-gray-400 hover:text-red-500 hover:border-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Compare Result Modal */}
      <AnimatePresence>
        {compareResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-dark-card rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-gray-100 dark:border-dark-border my-8">
              
              <div className="p-6 border-b border-gray-100 dark:border-dark-border flex justify-between items-center bg-gray-50 dark:bg-dark-bg/50">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Loan Comparison</h2>
                <button onClick={() => setCompareResult(null)} className="p-2 bg-white dark:bg-dark-card rounded-full text-gray-500 hover:text-red-500 shadow-sm"><X className="w-5 h-5"/></button>
              </div>

              <div className="p-6 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 bg-gray-50 dark:bg-dark-bg font-bold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-dark-border">Features</th>
                      {compareResult.compared.map(loan => (
                        <th key={loan.watchlistId} className={`p-4 border-b border-gray-200 dark:border-dark-border text-center ${compareResult.best === loan.watchlistId ? 'bg-green-50 dark:bg-green-500/10' : 'bg-gray-50 dark:bg-dark-bg'}`}>
                          <div className="font-bold text-gray-900 dark:text-white">{loan.bankName}</div>
                          {compareResult.best === loan.watchlistId && <span className="text-xs text-green-600 font-bold bg-green-100 dark:bg-green-500/20 px-2 py-1 rounded-full mt-2 inline-block">Best EMI</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-4 border-b border-gray-100 dark:border-dark-border font-medium text-gray-600 dark:text-gray-400">Interest Rate</td>
                      {compareResult.compared.map(loan => (
                        <td key={loan.watchlistId} className="p-4 border-b border-gray-100 dark:border-dark-border text-center font-semibold text-gray-900 dark:text-white">{loan.interestRate}%</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-gray-100 dark:border-dark-border font-medium text-gray-600 dark:text-gray-400">Loan Amount</td>
                      {compareResult.compared.map(loan => (
                        <td key={loan.watchlistId} className="p-4 border-b border-gray-100 dark:border-dark-border text-center text-gray-900 dark:text-white">{formatINR(loan.amount)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-gray-100 dark:border-dark-border font-medium text-gray-600 dark:text-gray-400">Tenure</td>
                      {compareResult.compared.map(loan => (
                        <td key={loan.watchlistId} className="p-4 border-b border-gray-100 dark:border-dark-border text-center text-gray-900 dark:text-white">{loan.tenure} months</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-gray-100 dark:border-dark-border font-medium text-gray-600 dark:text-gray-400">Monthly EMI</td>
                      {compareResult.compared.map(loan => (
                        <td key={loan.watchlistId} className="p-4 border-b border-gray-100 dark:border-dark-border text-center font-bold text-green-600 dark:text-green-500">₹{loan.emi.toLocaleString('en-IN')}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-gray-100 dark:border-dark-border font-medium text-gray-600 dark:text-gray-400">Total Interest</td>
                      {compareResult.compared.map(loan => (
                        <td key={loan.watchlistId} className="p-4 border-b border-gray-100 dark:border-dark-border text-center text-red-500">₹{loan.totalInterest.toLocaleString('en-IN')}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-gray-600 dark:text-gray-400">Processing Fee</td>
                      {compareResult.compared.map(loan => (
                        <td key={loan.watchlistId} className="p-4 text-center text-gray-900 dark:text-white">{loan.processingFeePercent}%</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Watchlist;