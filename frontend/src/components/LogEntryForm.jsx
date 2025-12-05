import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Heart, 
  Brain, 
  FileText, 
  Save,
  X,
  Loader2
} from 'lucide-react';

const LOG_TYPES = [
  { 
    value: 'symptom', 
    label: 'Symptom', 
    icon: Heart, 
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: 'Track pain, discomfort, or health symptoms'
  },
  { 
    value: 'fitness', 
    label: 'Fitness', 
    icon: Activity, 
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'Log workouts, exercise, and physical activity'
  },
  { 
    value: 'mood', 
    label: 'Mood', 
    icon: Brain, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Record emotions, mental state, and feelings'
  },
  { 
    value: 'food', 
    label: 'Food', 
    icon: FileText, 
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    description: 'Log meals, nutrition, and dietary intake'
  }
];

const TONE_OPTIONS = [
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'positive', label: 'Positive', emoji: '😊' },
  { value: 'negative', label: 'Negative', emoji: '😔' },
  { value: 'anxious', label: 'Anxious', emoji: '😰' },
  { value: 'calm', label: 'Calm', emoji: '😌' }
];

const LogEntryForm = ({ 
  initialText = '', 
  onSubmit, 
  onCancel, 
  isLoading = false,
  mode = 'create' // 'create' or 'edit'
}) => {
  const [formData, setFormData] = useState({
    type: 'symptom',
    text: initialText,
    tone: 'neutral',
    meta: {
      intensity: 5,
      tags: [],
      isVoice: false
    }
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  const selectedType = LOG_TYPES.find(t => t.value === formData.type);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleMetaChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        [field]: value
      }
    }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.meta.tags.includes(tag)) {
      handleMetaChange('tags', [...formData.meta.tags, tag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    handleMetaChange('tags', formData.meta.tags.filter(tag => tag !== tagToRemove));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.text.trim()) {
      newErrors.text = 'Please enter a log entry';
    }
    if (formData.text.length < 3) {
      newErrors.text = 'Entry must be at least 3 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="glass-card p-6 space-y-6"
    >
      {/* Log Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Entry Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {LOG_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = formData.type === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => handleChange('type', type.value)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? `border-${type.color.split('-')[1]}-500 ${type.bgColor} shadow-md`
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <Icon className={`h-6 w-6 mx-auto mb-2 ${isSelected ? type.color : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${isSelected ? type.color : 'text-gray-600'}`}>
                  {type.label}
                </span>
              </button>
            );
          })}
        </div>
        {selectedType && (
          <p className="text-xs text-gray-500 mt-2">{selectedType.description}</p>
        )}
      </div>

      {/* Text Entry */}
      <div>
        <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
          Your Entry
        </label>
        <textarea
          id="text"
          value={formData.text}
          onChange={(e) => handleChange('text', e.target.value)}
          placeholder="Describe what you're experiencing, how you feel, or what you did..."
          rows={5}
          className={`textarea-field ${errors.text ? 'border-red-500 focus:ring-red-500' : ''}`}
        />
        {errors.text && (
          <p className="text-red-500 text-sm mt-1">{errors.text}</p>
        )}
        <p className="text-xs text-gray-400 mt-1 text-right">
          {formData.text.length} characters
        </p>
      </div>

      {/* Tone Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          How are you feeling about this?
        </label>
        <div className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map((tone) => (
            <button
              key={tone.value}
              type="button"
              onClick={() => handleChange('tone', tone.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                formData.tone === tone.value
                  ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{tone.emoji}</span>
              {tone.label}
            </button>
          ))}
        </div>
      </div>

      {/* Intensity Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Intensity: <span className="text-primary-600 font-bold">{formData.meta.intensity}/10</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.meta.intensity}
          onChange={(e) => handleMetaChange('intensity', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Mild</span>
          <span>Moderate</span>
          <span>Severe</span>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (optional)
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.meta.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 text-primary-500 hover:text-primary-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
            placeholder="Add a tag..."
            className="input-field flex-1"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="btn-secondary px-4"
            disabled={!tagInput.trim()}
          >
            Add
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1"
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn-primary flex-1"
          disabled={isLoading || !formData.text.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              {mode === 'create' ? 'Save Entry' : 'Update Entry'}
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
};

export default LogEntryForm;