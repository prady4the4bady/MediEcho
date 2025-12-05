import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  Download, 
  Trash2, 
  Sparkles,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Heart,
  Brain,
  Moon,
  Loader2,
  CheckCircle
} from 'lucide-react';
import api from '../utils/api';
import Header from '../components/Header';

const BriefCard = ({ brief, onDelete, onDownload, onView }) => {
  const formatDateRange = (start, end) => {
    const startDate = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endDate = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startDate} - ${endDate}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card p-6 hover:border-cyan-500/30 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
            <FileText className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Weekly Health Brief</h3>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Calendar className="w-4 h-4" />
              {formatDateRange(brief.weekStart, brief.weekEnd)}
            </div>
          </div>
        </div>
        <span className="badge">{brief.logCount} logs</span>
      </div>

      {/* Summary Preview */}
      <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">
        {brief.summary}
      </p>

      {/* Key Insights Preview */}
      {brief.insights && brief.insights.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Key Insights</h4>
          <div className="space-y-1">
            {brief.insights.slice(0, 2).map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">{insight}</span>
              </div>
            ))}
            {brief.insights.length > 2 && (
              <p className="text-xs text-slate-500 ml-6">+{brief.insights.length - 2} more insights</p>
            )}
          </div>
        </div>
      )}

      {/* Health Scores */}
      {brief.scores && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
            <Heart className="w-4 h-4 text-red-400 mx-auto mb-1" />
            <span className="text-lg font-bold text-white">{brief.scores.physical || '--'}</span>
            <p className="text-xs text-slate-400">Physical</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
            <Brain className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <span className="text-lg font-bold text-white">{brief.scores.mental || '--'}</span>
            <p className="text-xs text-slate-400">Mental</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
            <Moon className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
            <span className="text-lg font-bold text-white">{brief.scores.sleep || '--'}</span>
            <p className="text-xs text-slate-400">Sleep</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
        <button
          onClick={() => onView(brief)}
          className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
        >
          View Full Brief
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          {brief.pdfUrl && (
            <button
              onClick={() => onDownload(brief._id)}
              className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-green-400 transition-colors"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(brief._id)}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-red-400 transition-colors"
            title="Delete Brief"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const BriefDetailModal = ({ brief, onClose }) => {
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
        className="glass-card p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
            <FileText className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Weekly Health Brief</h2>
            <p className="text-slate-400">
              {new Date(brief.weekStart).toLocaleDateString()} - {new Date(brief.weekEnd).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Summary
          </h3>
          <p className="text-slate-300 leading-relaxed bg-slate-800/50 rounded-lg p-4">
            {brief.summary}
          </p>
        </div>

        {/* Health Scores */}
        {brief.scores && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Health Scores
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <Heart className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <span className="text-3xl font-bold text-white">{brief.scores.physical || '--'}</span>
                <p className="text-sm text-slate-400 mt-1">Physical Wellness</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <Brain className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <span className="text-3xl font-bold text-white">{brief.scores.mental || '--'}</span>
                <p className="text-sm text-slate-400 mt-1">Mental Health</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <Moon className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                <span className="text-3xl font-bold text-white">{brief.scores.sleep || '--'}</span>
                <p className="text-sm text-slate-400 mt-1">Sleep Quality</p>
              </div>
            </div>
          </div>
        )}

        {/* Key Insights */}
        {brief.insights && brief.insights.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-cyan-400" />
              Key Insights
            </h3>
            <div className="space-y-2">
              {brief.insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-slate-800/50 rounded-lg p-3">
                  <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {brief.recommendations && brief.recommendations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Recommendations
            </h3>
            <div className="space-y-2">
              {brief.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                  <ChevronRight className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patterns */}
        {brief.patterns && brief.patterns.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Patterns Detected
            </h3>
            <div className="flex flex-wrap gap-2">
              {brief.patterns.map((pattern, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 text-sm rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30"
                >
                  {pattern}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 btn-secondary"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

export default function WeeklyBriefs() {
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedBrief, setSelectedBrief] = useState(null);
  const [canGenerate, setCanGenerate] = useState(true);

  useEffect(() => {
    fetchBriefs();
    checkCanGenerate();
  }, []);

  const fetchBriefs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/briefs');
      setBriefs(response.data);
    } catch (error) {
      console.error('Failed to fetch briefs:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCanGenerate = async () => {
    try {
      // Check if user has enough logs this week and hasn't already generated
      const response = await api.get('/logs');
      const logs = response.data;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const thisWeekLogs = logs.filter(l => new Date(l.createdAt) > weekAgo);
      setCanGenerate(thisWeekLogs.length >= 3);
    } catch (error) {
      setCanGenerate(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const response = await api.post('/briefs/generate');
      setBriefs([response.data, ...briefs]);
      setCanGenerate(false);
    } catch (error) {
      console.error('Failed to generate brief:', error);
      alert(error.response?.data?.message || 'Failed to generate brief. You need at least 3 logs this week.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (briefId) => {
    if (!window.confirm('Are you sure you want to delete this brief?')) return;
    
    try {
      await api.delete(`/briefs/${briefId}`);
      setBriefs(briefs.filter(b => b._id !== briefId));
    } catch (error) {
      console.error('Failed to delete brief:', error);
    }
  };

  const handleDownload = async (briefId) => {
    try {
      const response = await api.get(`/briefs/${briefId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `weekly-brief-${briefId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download brief:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Weekly Briefs</h1>
            <p className="text-slate-400">AI-generated summaries of your health journey</p>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || generating}
            className={`btn-primary flex items-center gap-2 ${
              (!canGenerate || generating) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate This Week's Brief
              </>
            )}
          </button>
        </div>

        {/* Info Banner */}
        {!canGenerate && !generating && (
          <div className="glass-card p-4 mb-6 border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-400">Not enough data</h4>
                <p className="text-sm text-slate-400 mt-1">
                  You need at least 3 voice logs this week to generate a health brief. 
                  Keep logging to unlock your weekly summary!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="glass-card p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">How Weekly Briefs Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Calendar className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">Log Daily</h4>
                <p className="text-sm text-slate-400">Record your symptoms, mood, and health notes throughout the week</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">AI Analysis</h4>
                <p className="text-sm text-slate-400">Our AI analyzes patterns, trends, and correlations in your data</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <FileText className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">Get Insights</h4>
                <p className="text-sm text-slate-400">Receive a comprehensive brief with scores, insights, and recommendations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Briefs List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-slate-700 rounded-xl" />
                  <div>
                    <div className="h-5 bg-slate-700 rounded w-32 mb-2" />
                    <div className="h-4 bg-slate-700 rounded w-24" />
                  </div>
                </div>
                <div className="h-4 bg-slate-700 rounded w-full mb-2" />
                <div className="h-4 bg-slate-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : briefs.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No briefs yet</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Start logging your health data regularly, and generate your first weekly brief 
              to get AI-powered insights into your health patterns.
            </p>
            <a href="/log/new" className="btn-primary">
              Create Your First Log
            </a>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <AnimatePresence>
              {briefs.map(brief => (
                <BriefCard
                  key={brief._id}
                  brief={brief}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                  onView={setSelectedBrief}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedBrief && (
            <BriefDetailModal brief={selectedBrief} onClose={() => setSelectedBrief(null)} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
