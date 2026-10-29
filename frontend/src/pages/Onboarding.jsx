import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Onboarding = () => {
  const { user, updateOnboarding } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateOnboarding({
        monthlyIncome: Number(formData.monthlyIncome),
        monthlyExpenses: Number(formData.monthlyExpenses),
        existingEMIs: Number(formData.existingEMIs) || 0,
        financialGoal: formData.financialGoal,
        riskAppetite: formData.riskAppetite,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex justify-center items-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 md:p-12"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.name}!</h1>
          <p className="text-gray-600">Let's set up your financial profile to personalize your AI experience.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income (₹)</label>
              <input 
                type="number" name="monthlyIncome" required value={formData.monthlyIncome} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="50000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Expenses (₹)</label>
              <input 
                type="number" name="monthlyExpenses" required value={formData.monthlyExpenses} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="25000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Existing EMIs (₹)</label>
              <input 
                type="number" name="existingEMIs" value={formData.existingEMIs} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Financial Goal</label>
              <select name="financialGoal" value={formData.financialGoal} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                <option value="save">Save Money</option>
                <option value="debt-free">Become Debt-Free</option>
                <option value="buy-house">Buy a House</option>
                <option value="buy-car">Buy a Car</option>
                <option value="invest">Invest & Grow</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Risk Appetite</label>
            <div className="grid grid-cols-3 gap-4">
              {['low', 'medium', 'high'].map((risk) => (
                <div 
                  key={risk}
                  onClick={() => setFormData({ ...formData, riskAppetite: risk })}
                  className={`p-4 rounded-xl border-2 text-center cursor-pointer capitalize transition-all ${
                    formData.riskAppetite === risk ? 'border-primary-600 bg-primary-50 text-primary-700 font-semibold' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {risk}
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-70"
          >
            {isLoading ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Onboarding;