import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  User, 
  LogOut, 
  CreditCard, 
  Menu, 
  X, 
  Home,
  FileText,
  Calendar,
  Settings,
  Plus,
  ChevronDown
} from 'lucide-react';

const Header = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Simplified check - in production use AuthContext
      setUser({ name: 'User' });
    }
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsProfileOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/logs', label: 'Log History', icon: FileText },
    { path: '/briefs', label: 'Weekly Briefs', icon: Calendar },
  ];

  return (
    <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              MediEcho
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                {navLinks.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(path)
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                ))}
                
                {/* New Log Button */}
                <Link
                  to="/log/new"
                  className="ml-2 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                  New Log
                </Link>

                {/* Profile Dropdown */}
                <div className="relative ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProfileOpen(!isProfileOpen);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-3 border-b border-slate-700">
                          <p className="text-sm font-medium text-white">{user.name}</p>
                          <p className="text-xs text-slate-400">Free Plan</p>
                        </div>
                        <div className="p-1">
                          <Link
                            to="/settings"
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Settings className="w-4 h-4" />
                            Settings
                          </Link>
                          <Link
                            to="/subscription/portal"
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <CreditCard className="w-4 h-4" />
                            Billing
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/#features" className="px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors">
                  Features
                </Link>
                <Link to="/pricing" className="px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors">
                  Pricing
                </Link>
                <Link to="/login" className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-1 border-t border-slate-800">
                {user ? (
                  <>
                    {navLinks.map(({ path, label, icon: Icon }) => (
                      <Link
                        key={path}
                        to={path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive(path)
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {label}
                      </Link>
                    ))}
                    <Link
                      to="/log/new"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                    >
                      <Plus className="w-5 h-5" />
                      New Log
                    </Link>
                    <div className="pt-4 mt-4 border-t border-slate-800 space-y-1">
                      <Link
                        to="/settings"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 rounded-lg"
                      >
                        <Settings className="w-5 h-5" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-lg"
                      >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      to="/pricing"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 rounded-lg"
                    >
                      Pricing
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 rounded-lg"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="block mx-4 px-4 py-3 text-sm text-center font-medium bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;