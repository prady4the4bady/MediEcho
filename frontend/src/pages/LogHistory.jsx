import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Calendar, 
  Mic, 
  Heart, 
  Brain, 
  Moon,
  Pill,
  Activity,
  AlertCircle,
  ChevronDown,
  Trash2,
  Eye,
  Clock
} from 'lucide-react';
import { getLogs, deleteLog } from '../utils/api';
import Header from '../components/Header';

const LOG_TYPES = [
  { value: 'symptom', label: 'Symptom', icon: AlertCircle, color: 'text-red-400' },
  { value: 'mood', label: 'Mood', icon: Brain, color: 'text-purple-400' },
  { value: 'medication', label: 'Medication', icon: Pill, color: 'text-blue-400' },
  { value: 'vitals', label: 'Vitals', icon: Activity, color: 'text-green-400' },
  { value: 'sleep', label: 'Sleep', icon: Moon, color: 'text-indigo-400' },
  { value: 'general', label: 'General', icon: Heart, color: 'text-pink-400' },
];

const LogCard = ({ log, onDelete, onView }) => {
  const logType = LOG_TYPES.find(t => t.value === log.type) || LOG_TYPES[5];
  const IconComponent = logType.icon;
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card p-5 hover:border-cyan-500/30 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-slate-700/50 ${logType.color}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400">
              {logType.label}
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <Clock className="w-3 h-3" />
              {formatDate(log.createdAt)}
            </div>
          </div>
        </div>
        
        {log.intensity && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">Intensity:</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i <= log.intensity 
                      ? log.intensity <= 2 
                        ? 'bg-green-400' 
                        : log.intensity <= 3 
                          ? 'bg-yellow-400' 
                          : 'bg-red-400'
                      : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-slate-300 text-sm leading-relaxed mb-3 line-clamp-3">
        {log.transcript}
      </p>

      {log.tags && log.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {log.tags.slice(0, 4).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
            >
              {tag}
            </span>
          ))}
          {log.tags.length > 4 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-400">
              +{log.tags.length - 4} more
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
        {log.tone && (
          <span className="text-xs text-slate-400">
            Mood: <span className="text-slate-300 capitalize">{log.tone}</span>
          </span>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(log)}
            className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(log._id)}
            className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const LogDetailModal = ({ log, onClose }) => {
  const logType = LOG_TYPES.find(t => t.value === log.type) || LOG_TYPES[5];
  const IconComponent = logType.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl bg-slate-700/50 ${logType.color}`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{logType.label} Log</h3>
            <p className="text-sm text-slate-400">
              {new Date(log.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400 mb-1 block">
              Transcript
            </label>
            <p className="text-slate-200 leading-relaxed bg-slate-800/50 rounded-lg p-4">
              {log.transcript}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {log.tone && (
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400 mb-1 block">
                  Mood/Tone
                </label>
                <p className="text-slate-200 capitalize">{log.tone}</p>
              </div>
            )}
            {log.intensity && (
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400 mb-1 block">
                  Intensity
                </label>
                <p className="text-slate-200">{log.intensity}/5</p>
              </div>
            )}
          </div>

          {log.tags && log.tags.length > 0 && (
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 mb-2 block">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {log.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-sm rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 btn-secondary"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

export default function LogHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const logsData = await getLogs();
      setLogs(logsData || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (logId) => {
    if (!window.confirm('Are you sure you want to delete this log?')) return;
    
    try {
      await deleteLog(logId);
      setLogs(logs.filter(l => l._id !== logId));
    } catch (error) {
      console.error('Failed to delete log:', error);
    }
  };

  const filteredLogs = logs.filter(log => {
    // Search filter
    if (searchTerm && !log.transcript.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // Type filter
    if (selectedType !== 'all' && log.type !== selectedType) {
      return false;
    }
    // Date range filter
    if (dateRange.start) {
      const logDate = new Date(log.createdAt);
      const startDate = new Date(dateRange.start);
      if (logDate < startDate) return false;
    }
    if (dateRange.end) {
      const logDate = new Date(log.createdAt);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      if (logDate > endDate) return false;
    }
    return true;
  });

  const stats = {
    total: logs.length,
    thisWeek: logs.filter(l => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(l.createdAt) > weekAgo;
    }).length,
    avgIntensity: logs.length > 0 
      ? (logs.reduce((sum, l) => sum + (l.intensity || 0), 0) / logs.filter(l => l.intensity).length).toFixed(1)
      : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Log History</h1>
          <p className="text-slate-400">Browse and manage all your voice journal entries</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Mic className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-slate-400">Total Logs</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Calendar className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.thisWeek}</p>
                <p className="text-xs text-slate-400">This Week</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.avgIntensity}</p>
                <p className="text-xs text-slate-400">Avg Intensity</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="glass-card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search logs..."
                className="input-field pl-10 w-full"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input-field appearance-none pr-10 min-w-[150px]"
              >
                <option value="all">All Types</option>
                {LOG_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-cyan-500/20' : ''}`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-slate-700/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">End Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="input-field w-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-400">
            Showing {filteredLogs.length} of {logs.length} logs
          </p>
        </div>

        {/* Logs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-1/3 mb-3" />
                <div className="h-3 bg-slate-700 rounded w-full mb-2" />
                <div className="h-3 bg-slate-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-16">
            <Mic className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No logs found</h3>
            <p className="text-slate-400 mb-6">
              {logs.length === 0 
                ? "Start recording your first voice log to see it here"
                : "Try adjusting your filters to see more results"
              }
            </p>
            <a href="/log/new" className="btn-primary">
              Create New Log
            </a>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {filteredLogs.map(log => (
                <LogCard
                  key={log._id}
                  log={log}
                  onDelete={handleDelete}
                  onView={setSelectedLog}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedLog && (
            <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
