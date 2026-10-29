import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { 
  LayoutDashboard, Landmark, PieChart, BookOpen, Bot, 
  Bell, Sun, Moon, LogOut, Wallet, Menu, User, Gauge, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🔔 Notification State
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Fetch notifications on load
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get('/alerts');
        setAlerts(res.data.alerts);
        setUnreadCount(res.data.unreadCount);
      } catch (error) {
        console.error("Failed to fetch alerts", error);
      }
    };
    fetchAlerts();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/alerts/read-all');
      setAlerts(alerts.map(a => ({ ...a, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await logout();
    // 👈 FIX: hard reload to landing page to bypass ProtectedRoute redirect
    window.location.href = '/'; 
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Loan Explorer', path: '/loans', icon: <Landmark className="w-5 h-5" /> },
    { name: 'Budget Tracker', path: '/budget', icon: <PieChart className="w-5 h-5" /> },
    { name: 'Credit Score', path: '/credit-score', icon: <Gauge className="w-5 h-5" /> },
    { name: 'Learn Center', path: '/learn', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'AI Assistant', path: '/chat', icon: <Bot className="w-5 h-5" /> },
    { name: 'My Profile', path: '/profile', icon: <User className="w-5 h-5" /> },
  ];

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-dark-border">
        <Link to="/dashboard" className="flex items-center gap-2"> 
          <div className="bg-primary-600 p-1.5 rounded-lg">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">FinMate AI</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-primary-500/10 text-primary-600 dark:text-primary-500 font-semibold' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg hover:text-gray-900 dark:hover:text-white font-medium'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-dark-border">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex transition-colors duration-300">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-dark-card border-r border-gray-100 dark:border-dark-border fixed h-full z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.aside 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-dark-card border-r border-gray-100 dark:border-dark-border z-50 flex flex-col md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-gray-100 dark:border-dark-border sticky top-0 z-50 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-gray-600 dark:text-gray-300">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 capitalize">
              {location.pathname.replace('/', '') || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {/* 🔔 Notification Bell with Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)} 
                className="p-2 rounded-full bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-dark-card"></span>
                )}
              </button>

              {/* Dropdown Panel */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-100 dark:border-dark-border overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-dark-border flex justify-between items-center bg-gray-50 dark:bg-dark-bg/50">
                      <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {alerts.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-sm">
                          No new notifications.
                        </div>
                      ) : (
                        alerts.map((alert) => (
                          <div key={alert._id} className={`p-4 border-b border-gray-50 dark:border-dark-border/50 last:border-0 ${!alert.isRead ? 'bg-primary-50/30 dark:bg-primary-500/5' : ''}`}>
                            <div className="flex gap-3">
                              <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${!alert.isRead ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{alert.title}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
                                <p className="text-[10px] text-gray-400 mt-2">
                                  {new Date(alert.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 border-l border-gray-200 dark:border-dark-border pl-4 cursor-pointer" onClick={() => navigate('/profile')}>
              <div className="w-9 h-9 rounded-full bg-primary-500/20 text-primary-600 flex items-center justify-center font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;