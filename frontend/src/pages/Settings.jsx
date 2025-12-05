import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Save,
  Loader2,
  Check,
  AlertCircle,
  LogOut,
  Trash2,
  Download,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { getMe, createCustomerPortal } from '../utils/api';
import Header from '../components/Header';

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [user, setUser] = useState({
    name: '',
    email: '',
    subscription: null
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    weeklyReminders: true,
    briefNotifications: true,
    darkMode: true,
    autoTranscribe: true,
    dataRetention: '1year'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userData = await getMe();
      const userInfo = userData.user || userData;
      setUser(userInfo);
      if (userInfo.preferences) {
        setPreferences(prev => ({ ...prev, ...userInfo.preferences }));
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      setError('');
      await api.put('/auth/preferences', preferences);
      setSuccess('Preferences saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await api.put('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setSuccess('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await api.get('/auth/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mediecho-export-${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
    );
    
    if (!confirmed) return;

    const doubleConfirm = window.prompt(
      'Type "DELETE" to confirm account deletion:'
    );

    if (doubleConfirm !== 'DELETE') return;

    try {
      await api.delete('/auth/account');
      localStorage.removeItem('token');
      navigate('/');
    } catch (error) {
      setError('Failed to delete account');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleManageSubscription = async () => {
    try {
      const data = await createCustomerPortal();
      window.location.href = data.url;
    } catch (error) {
      const errorMessage = error.response?.data?.error;
      if (error.response?.status === 400) {
        setError(errorMessage || 'No active subscription found. Subscribe to a plan first to manage billing.');
      } else if (error.response?.status === 404) {
        setError('User not found. Please log in again.');
      } else {
        setError(errorMessage || 'Failed to access customer portal. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Manage your account and preferences</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center gap-3"
          >
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-green-300">{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-400" />
              Profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Name</label>
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="input-field w-full opacity-50 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
              </div>
            </div>
          </div>

          {/* Subscription Section */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cyan-400" />
              Subscription
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium capitalize">
                  {user.subscriptionPlan || user.subscription?.plan || 'Free'} Plan
                </p>
                <p className="text-sm text-slate-400">
                  {(user.subscriptionStatus === 'active' || user.subscription?.status === 'active')
                    ? `Renews on ${new Date(user.subscriptionEndDate || user.subscription?.currentPeriodEnd).toLocaleDateString()}`
                    : 'No active subscription'
                  }
                </p>
              </div>
              {(user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing' || 
                user.subscription?.status === 'active' || user.stripeCustomerId) ? (
                <button
                  onClick={handleManageSubscription}
                  className="btn-secondary flex items-center gap-2"
                >
                  Manage Billing
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => navigate('/pricing')}
                  className="btn-primary flex items-center gap-2"
                >
                  Upgrade Plan
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-cyan-400" />
              Notifications
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-white">Email Notifications</p>
                  <p className="text-sm text-slate-400">Receive important account updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-white">Weekly Reminders</p>
                  <p className="text-sm text-slate-400">Remind me to log health data</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.weeklyReminders}
                  onChange={(e) => setPreferences({ ...preferences, weeklyReminders: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-white">Brief Ready Notifications</p>
                  <p className="text-sm text-slate-400">Notify when weekly brief is generated</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.briefNotifications}
                  onChange={(e) => setPreferences({ ...preferences, briefNotifications: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
              </label>
            </div>
            <button
              onClick={handleSavePreferences}
              disabled={saving}
              className="mt-4 btn-primary flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Preferences
            </button>
          </div>

          {/* Security Section */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              Security
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="input-field w-full"
                />
              </div>
              <button
                type="submit"
                disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword}
                className="btn-secondary"
              >
                Change Password
              </button>
            </form>
          </div>

          {/* Data Management */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-cyan-400" />
              Data Management
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Export Your Data</p>
                  <p className="text-sm text-slate-400">Download all your logs and briefs</p>
                </div>
                <button onClick={handleExportData} className="btn-secondary">
                  Export Data
                </button>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Data Retention</label>
                <select
                  value={preferences.dataRetention}
                  onChange={(e) => setPreferences({ ...preferences, dataRetention: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="6months">6 Months</option>
                  <option value="1year">1 Year</option>
                  <option value="2years">2 Years</option>
                  <option value="forever">Keep Forever</option>
                </select>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card p-6 border-red-500/30">
            <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Danger Zone
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Sign Out</p>
                  <p className="text-sm text-slate-400">Sign out of your account</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <div>
                  <p className="text-white">Delete Account</p>
                  <p className="text-sm text-slate-400">Permanently delete your account and all data</p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
