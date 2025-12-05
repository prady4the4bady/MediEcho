import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, Pause, RotateCcw, Check, AlertCircle } from 'lucide-react';
const VoiceRecorder = ({ onTranscript, onRecordingComplete, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Check for browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }
  }, []);

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
        if (onTranscript) {
          onTranscript(finalTranscript);
        }
      }
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else if (event.error === 'audio-capture') {
        setError('No microphone found. Please check your microphone.');
      } else if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access.');
      } else {
        setError(`Error: ${event.error}`);
      }
      stopRecording();
    };

    recognition.onend = () => {
      if (isRecording && !isPaused) {
        // Auto-restart if still recording
        try {
          recognition.start();
        } catch (e) {
          console.log('Recognition already started');
        }
      }
    };

    return recognition;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, isPaused, onTranscript]);

  // Start audio visualization
  const startAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const updateLevel = () => {
        if (!analyserRef.current) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
        
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  // Stop audio visualization
  const stopAudioVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioLevel(0);
  };

  // Start recording
  const startRecording = async () => {
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    setRecordingTime(0);

    recognitionRef.current = initRecognition();
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.start();
      setIsRecording(true);
      setIsPaused(false);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Start audio visualization
      await startAudioVisualization();
    } catch (err) {
      setError('Failed to start recording. Please try again.');
      console.error('Error starting recognition:', err);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    stopAudioVisualization();
    
    setIsRecording(false);
    setIsPaused(false);
    setInterimTranscript('');

    if (onRecordingComplete && transcript) {
      onRecordingComplete(transcript.trim());
    }
  };

  // Pause recording
  const pauseRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsPaused(true);
  };

  // Resume recording
  const resumeRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        recognitionRef.current = initRecognition();
        recognitionRef.current?.start();
      }
    }
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    setIsPaused(false);
  };

  // Reset recording
  const resetRecording = () => {
    stopRecording();
    setTranscript('');
    setRecordingTime(0);
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopAudioVisualization();
    };
  }, []);

  if (!isSupported) {
    return (
      <div className="glass-card p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 font-medium">{error}</p>
        <p className="text-gray-500 text-sm mt-2">
          Try using Google Chrome, Microsoft Edge, or Safari for voice recording.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center"
          >
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Controls */}
      <div className="flex flex-col items-center">
        {/* Audio Level Visualizer */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex items-center justify-center gap-1 h-16"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-primary-500 rounded-full"
                animate={{
                  height: isRecording && !isPaused
                    ? Math.max(4, Math.random() * audioLevel * 60 + 4)
                    : 4
                }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </motion.div>
        )}

        {/* Timer */}
        <div className="text-3xl font-mono font-bold text-gray-800 mb-6">
          {formatTime(recordingTime)}
        </div>

        {/* Main Recording Button */}
        <div className="relative mb-6">
          {isRecording && !isPaused && (
            <>
              <div className="absolute inset-0 rounded-full bg-red-400/30 animate-ping" />
              <div className="absolute inset-[-8px] rounded-full bg-red-400/20 animate-pulse" />
            </>
          )}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-primary-600 hover:bg-primary-700'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRecording ? (
              <Square className="h-8 w-8 text-white" fill="white" />
            ) : (
              <Mic className="h-8 w-8 text-white" />
            )}
          </button>
        </div>

        {/* Secondary Controls */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            <button
              onClick={isPaused ? resumeRecording : pauseRecording}
              className="btn-secondary"
            >
              {isPaused ? (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </>
              )}
            </button>
            <button onClick={resetRecording} className="btn-secondary">
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset
            </button>
          </motion.div>
        )}

        {/* Status Text */}
        <p className="text-sm text-gray-500 mt-4">
          {!isRecording && 'Tap to start recording'}
          {isRecording && !isPaused && 'Recording... Tap to stop'}
          {isRecording && isPaused && 'Paused'}
        </p>
      </div>

      {/* Transcript Preview */}
      {(transcript || interimTranscript) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 p-4 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Transcript</span>
            {transcript && (
              <span className="text-xs text-green-600 flex items-center">
                <Check className="h-3 w-3 mr-1" />
                {transcript.split(' ').length} words
              </span>
            )}
          </div>
          <p className="text-gray-800">
            {transcript}
            <span className="text-gray-400 italic">{interimTranscript}</span>
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default VoiceRecorder;