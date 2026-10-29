import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  IndianRupee, Target, ShieldAlert, Mail, 
  CheckCircle2, Save, TrendingDown, Landmark
} from 'lucide-react';

const Profile = () => {
  const { user, updateOnboarding } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    monthlyIncome: user?.monthlyIncome || '',
    monthlyExpenses: user?.monthlyExpenses || '',
    existingEMIs: user?.existingEMIs || '',
    financialGoal: user?.financialGoal || 'save',
    riskAppetite: user?.riskAppetite || 'medium',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRiskChange = (risk) => {
    setFormData({ ...formData, riskAppetite: risk });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      await updateOnboarding({
        monthlyIncome: Number(formData.monthlyIncome),
        monthlyExpenses: Number(formData.monthlyExpenses),
        existingEMIs: Number(formData.existingEMIs) || 0,
        financialGoal: formData.financialGoal,
        riskAppetite: formData.riskAppetite,
      });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      
      {/* Header Banner (Compact) */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-primary-100 flex items-center gap-1.5 text-sm mt-0.5">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
      </motion.div>

      {message && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-3 rounded-lg text-sm font-semibold flex items-center gap-2 ${message.includes('success') ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          <CheckCircle2 className="w-4 h-4" /> {message}
        </motion.div>
      )}

      {/* Main Form Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden">
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Section 1: Financial Details */}
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-dark-border pb-2">
              <Landmark className="w-4 h-4 text-primary-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Financial Details</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Income */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Monthly Income</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IndianRupee className="w-4 h-4 text-green-500" />
                  </div>
                  <input 
                    type="number" name="monthlyIncome" required value={formData.monthlyIncome} onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white text-sm font-medium transition-all"
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>

              {/* Expenses */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Monthly Expenses</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  </div>
                  <input 
                    type="number" name="monthlyExpenses" required value={formData.monthlyExpenses} onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white text-sm font-medium transition-all"
                    placeholder="e.g. 25000"
                  />
                </div>
              </div>

              {/* Existing EMIs */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Existing EMIs</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldAlert className="w-4 h-4 text-orange-500" />
                  </div>
                  <input 
                    type="number" name="existingEMIs" value={formData.existingEMIs} onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white text-sm font-medium transition-all"
                    placeholder="e.g. 5000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Goals & Preferences */}
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-dark-border pb-2 mt-2">
              <Target className="w-4 h-4 text-purple-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Goals & Preferences</h2>
            </div>
            
            <div className="space-y-5">
              {/* Financial Goal */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Primary Financial Goal</label>
                <select 
                  name="financialGoal" value={formData.financialGoal} onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white text-sm font-medium appearance-none cursor-pointer"
                >
                  <option value="save">💰 Save Money</option>
                  <option value="debt-free">🔓 Become Debt-Free</option>
                  <option value="buy-house">🏠 Buy a House</option>
                  <option value="buy-car">🚗 Buy a Car</option>
                  <option value="invest">📈 Invest & Grow</option>
                </select>
              </div>

              {/* Risk Appetite Cards (Compact) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Risk Appetite</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'low', title: 'Low', desc: 'Safety first', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500' },
                    { id: 'medium', title: 'Medium', desc: 'Balanced', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500' },
                    { id: 'high', title: 'High', desc: 'Aggressive', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500' }
                  ].map((risk) => {
                    const isSelected = formData.riskAppetite === risk.id;
                    return (
                      <div 
                        key={risk.id}
                        onClick={() => handleRiskChange(risk.id)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? `${risk.border} ${risk.bg}` 
                            : 'border-gray-100 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-0.5">
                          <span className={`text-sm font-bold ${isSelected ? risk.color : 'text-gray-900 dark:text-white'}`}>{risk.title}</span>
                          {isSelected && <CheckCircle2 className={`w-4 h-4 ${risk.color}`} />}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{risk.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-100 dark:border-dark-border flex justify-end">
            <button 
              type="submit" 
              disabled={isLoading} 
              className="bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-primary-700 transition-all shadow-md shadow-primary-500/20 flex items-center justify-center gap-2 disabled:opacity-70 w-full sm:w-auto"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;