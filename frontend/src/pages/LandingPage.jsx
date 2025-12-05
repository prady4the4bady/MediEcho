import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Shield, FileText, Heart, ArrowRight, Star } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: <Mic className="h-8 w-8 text-primary-600" />,
      title: "Voice-First Journaling",
      description: "Speak naturally about your symptoms, fitness, and mood. Our AI understands context and tone."
    },
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: "Privacy-First Design",
      description: "Your health data stays private. Choose local storage or encrypted cloud sync."
    },
    {
      icon: <FileText className="h-8 w-8 text-primary-600" />,
      title: "Weekly AI Briefs",
      description: "Get encrypted PDF summaries of your health patterns and personalized insights."
    },
    {
      icon: <Heart className="h-8 w-8 text-primary-600" />,
      title: "AI Health Coach",
      description: "Real-time voice coaching and wellness recommendations based on your journal."
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Fitness Enthusiast",
      content: "MediEcho helps me track my fitness journey effortlessly. The voice interface makes logging so natural."
    },
    {
      name: "Dr. James K.",
      role: "Healthcare Professional",
      content: "As a doctor, I appreciate the privacy focus and clinical-grade data organization."
    },
    {
      name: "Maria L.",
      role: "Chronic Condition Patient",
      content: "Managing my symptoms is so much easier now. The AI insights have been incredibly helpful."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Your Voice,
              <span className="text-primary-600"> Your Health</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              MediEcho is a privacy-first, voice-first medical & fitness journal with AI-powered insights and weekly encrypted reports.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg px-8 py-4">
                Start Your Journey
                <ArrowRight className="inline-block ml-2 h-5 w-5" />
              </Link>
              <Link to="/pricing" className="btn-secondary text-lg px-8 py-4">
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose MediEcho?
            </h2>
            <p className="text-xl text-gray-600">
              Built for healthcare with privacy, accessibility, and AI at its core.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-card p-6 text-center"
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Users Worldwide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Health Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who trust MediEcho with their health data.
          </p>
          <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold text-lg px-8 py-4 rounded-lg transition-colors duration-200">
            Get Started Free
            <ArrowRight className="inline-block ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;