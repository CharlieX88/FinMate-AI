import { Link } from 'react-router-dom';
import { Wallet, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const LandingNavbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 w-full bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md z-50 border-b border-gray-100 dark:border-dark-border transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary-600 p-2 rounded-xl">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">FinMate AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 font-medium">Features</a>
            <a href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 font-medium">How it Works</a>
            <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 font-medium">Login</Link>
            
            <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <Link 
              to="/register" 
              className="bg-primary-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default LandingNavbar;