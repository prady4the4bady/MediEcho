import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Twitter, 
  Github, 
  Linkedin, 
  Mail,
  Shield,
  FileText
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '/#features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'How It Works', href: '/#how-it-works' },
      { name: 'FAQ', href: '/#faq' }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'HIPAA Compliance', href: '/hipaa' },
      { name: 'Cookie Policy', href: '/cookies' }
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/api' },
      { name: 'Status', href: '/status' }
    ]
  };

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/mediecho' },
    { name: 'GitHub', icon: Github, href: 'https://github.com/mediecho' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/mediecho' },
    { name: 'Email', icon: Mail, href: 'mailto:hello@mediecho.io' }
  ];

  return (
    <footer className="bg-slate-900/50 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                MediEcho
              </span>
            </Link>
            <p className="text-slate-400 text-sm mb-4 max-w-xs">
              Privacy-first voice journaling for health tracking. Record your symptoms, 
              moods, and wellness data securely with AI-powered insights.
            </p>
            
            {/* Trust Badges */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Shield className="w-4 h-4 text-green-500" />
                <span>HIPAA Ready</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>SOC 2</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="py-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">Stay Updated</h4>
              <p className="text-sm text-slate-400">Get health tips and product updates in your inbox.</p>
            </div>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <span>© {currentYear} MediEcho. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-400 fill-current" />
            <span>for your health</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
