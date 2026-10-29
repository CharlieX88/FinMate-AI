import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';

// Protected Pages
import Dashboard from './pages/Dashboard';
import LoanExplorer from './pages/LoanExplorer';
import BudgetTracker from './pages/BudgetTracker'; 
import Profile from './pages/Profile'; 
import LearnCenter from './pages/LearnCenter'; 
import AIChat from './pages/AIChat';
import CreditScore from './pages/CreditScore'; 

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white">Loading...</div>;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />
        
        {/* Layout Wrapper for App Pages */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/loans" element={<LoanExplorer />} />
          <Route path="/budget" element={<BudgetTracker />} /> 
          <Route path="/credit-score" element={<CreditScore />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/learn" element={<LearnCenter />} />
          <Route path="/chat" element={<AIChat />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;