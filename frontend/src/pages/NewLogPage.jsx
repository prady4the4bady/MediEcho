import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Keyboard, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import VoiceRecorder from '../components/VoiceRecorder';
import LogEntryForm from '../components/LogEntryForm';
import { createLog } from '../utils/api';

const NewLogPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null); // 'voice' or 'text'
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleVoiceTranscript = (text) => {
    setVoiceTranscript(prev => prev + text);
  };

  const handleRecordingComplete = (transcript) => {
    setVoiceTranscript(transcript);
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await createLog({
        ...formData,
        meta: {
          ...formData.meta,
          isVoice: mode === 'voice'
        }
      });

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save log. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (mode) {
      setMode(null);
      setVoiceTranscript('');
    } else {
      navigate(-1);
    }
  };

  // Success overlay
  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Entry Saved!</h2>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-4"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Log Entry</h1>
            <p className="text-gray-600">Record your symptoms, fitness, or mood</p>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center"
            >
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode Selection */}
        {!mode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-6"
          >
            <button
              onClick={() => setMode('voice')}
              className="glass-card p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="bg-primary-100 p-6 rounded-full inline-flex mb-4 group-hover:bg-primary-200 transition-colors">
                <Mic className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Voice Entry</h3>
              <p className="text-gray-600">
                Speak naturally and let AI transcribe your thoughts
              </p>
            </button>

            <button
              onClick={() => setMode('text')}
              className="glass-card p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="bg-secondary-100 p-6 rounded-full inline-flex mb-4 group-hover:bg-secondary-200 transition-colors">
                <Keyboard className="h-12 w-12 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Text Entry</h3>
              <p className="text-gray-600">
                Type your log entry manually
              </p>
            </button>
          </motion.div>
        )}

        {/* Voice Recording Mode */}
        {mode === 'voice' && !voiceTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <VoiceRecorder
              onTranscript={handleVoiceTranscript}
              onRecordingComplete={handleRecordingComplete}
            />
            <div className="mt-4 text-center">
              <button
                onClick={() => setMode(null)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Switch to text entry
              </button>
            </div>
          </motion.div>
        )}

        {/* Voice Transcript Review / Text Entry Form */}
        {(mode === 'text' || (mode === 'voice' && voiceTranscript)) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {mode === 'voice' && voiceTranscript && (
              <div className="mb-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
                <div className="flex items-center text-primary-700 text-sm mb-2">
                  <Mic className="h-4 w-4 mr-1" />
                  Voice transcription - review and edit if needed
                </div>
              </div>
            )}
            <LogEntryForm
              initialText={voiceTranscript}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
              mode="create"
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NewLogPage;