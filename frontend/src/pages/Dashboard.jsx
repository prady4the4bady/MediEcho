import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mic, 
  FileText, 
  TrendingUp, 
  Activity, 
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Heart,
  Brain,
  Moon,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import api from '../utils/api';
import Header from '../components/Header';

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [briefs, setBriefs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [logsResponse, briefsResponse, userResponse] = await Promise.all([
        api.get('/logs').catch(() => ({ data: [] })),
        api.get('/briefs').catch(() => ({ data: [] })),
        api.get('/auth/me').catch(() => ({ data: null }))
      ]);
      setLogs(logsResponse.data || []);
      setBriefs(briefsResponse.data || []);
      setUser(userResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const recentLogs = logs.slice(0, 5);
  const latestBrief = briefs[0];

  // Calculate stats
  const thisWeekLogs = logs.filter(log => {
    const logDate = new Date(log.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logDate >= weekAgo;
  });

  const streakDays = calculateStreak(logs);

  function calculateStreak(logs) {
    if (logs.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    while (true) {
      const hasLogOnDate = logs.some(log => {
        const logDate = new Date(log.createdAt);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === currentDate.getTime();
      });
      
      if (hasLogOnDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }

  const getLogTypeIcon = (type) => {
    switch (type) {
      case 'symptom': return AlertCircle;
      case 'mood': return Brain;
      case 'sleep': return Moon;
      default: return Heart;
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diff = now - past;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back{user?.name ? `, ${user.name}` : ''}! 👋
          </h1>
          <p className="text-slate-400">Here's your health journey overview.</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Mic className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{logs.length}</p>
            <p className="text-sm text-slate-400">Total Logs</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{thisWeekLogs.length}</p>
            <p className="text-sm text-slate-400">This Week</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{streakDays}</p>
            <p className="text-sm text-slate-400">Day Streak</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <FileText className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{briefs.length}</p>
            <p className="text-sm text-slate-400">Briefs</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 group hover:border-cyan-500/30 transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-colors">
                <Mic className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">New Voice Log</h3>
                <p className="text-sm text-slate-400">Record your health data</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Start a voice recording to log symptoms, mood, medication, or any health observations.
            </p>
            <Link 
              to="/log/new" 
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Mic className="w-5 h-5" />
              Start Recording
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 group hover:border-purple-500/30 transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-colors">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Weekly Brief</h3>
                <p className="text-sm text-slate-400">AI-powered health insights</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Generate an AI summary of your health patterns, trends, and personalized recommendations.
            </p>
            <Link 
              to="/briefs" 
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-colors"
            >
              <FileText className="w-5 h-5" />
              View Briefs
            </Link>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Logs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 glass-card"
          >
            <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Recent Logs</h3>
              <Link 
                to="/logs" 
                className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {recentLogs.length > 0 ? (
              <div className="divide-y divide-slate-700/50">
                {recentLogs.map((log) => {
                  const IconComponent = getLogTypeIcon(log.type);
                  return (
                    <div 
                      key={log._id} 
                      className="p-4 hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${
                          log.type === 'symptom' ? 'bg-red-500/20 text-red-400' :
                          log.type === 'mood' ? 'bg-purple-500/20 text-purple-400' :
                          log.type === 'sleep' ? 'bg-indigo-500/20 text-indigo-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white capitalize">{log.type}</span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(log.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 line-clamp-2">
                            {log.transcript || log.text}
                          </p>
                          {log.tags && log.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {log.tags.slice(0, 3).map((tag, i) => (
                                <span 
                                  key={i}
                                  className="px-2 py-0.5 text-xs rounded-full bg-slate-700/50 text-slate-400"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Mic className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">No logs yet. Start recording your health journey!</p>
                <Link to="/log/new" className="btn-primary">
                  Create Your First Log
                </Link>
              </div>
            )}
          </motion.div>

          {/* Latest Brief / Health Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Latest Brief Card */}
            {latestBrief ? (
              <div className="glass-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                    <FileText className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Latest Brief</h3>
                    <p className="text-xs text-slate-400">
                      {new Date(latestBrief.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-slate-300 line-clamp-3 mb-4">
                  {latestBrief.summary}
                </p>

                {latestBrief.scores && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                      <Heart className="w-4 h-4 text-red-400 mx-auto mb-1" />
                      <span className="text-lg font-bold text-white">{latestBrief.scores.physical || '--'}</span>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                      <Brain className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <span className="text-lg font-bold text-white">{latestBrief.scores.mental || '--'}</span>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                      <Moon className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                      <span className="text-lg font-bold text-white">{latestBrief.scores.sleep || '--'}</span>
                    </div>
                  </div>
                )}

                <Link 
                  to="/briefs" 
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-cyan-400 hover:text-cyan-300"
                >
                  View Full Brief
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="glass-card p-5 text-center">
                <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">No Brief Yet</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Log at least 3 entries this week to generate your first health brief.
                </p>
                <div className="text-sm text-slate-500">
                  {thisWeekLogs.length}/3 logs this week
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" />
                Quick Tips
              </h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  Log daily for better pattern recognition
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  Include specific times for symptoms
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  Rate intensity for accurate tracking
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  Use tags to categorize entries
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
