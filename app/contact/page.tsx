import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us | F1 Predictor League",
  description: "Get in touch with F1 Apex Predictions team. We'd love to hear from you!",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0B0C10] text-gray-300 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 border-b border-gray-800 pb-8">
          <Link href="/" className="text-red-500 hover:text-red-400 text-sm uppercase tracking-widest mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black font-orbitron text-white mb-4">
            Contact Us
          </h1>
          <p className="text-gray-500">We'd love to hear from you!</p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Get in Touch</h2>
              <p className="text-gray-400 leading-relaxed">
                Have questions, feedback, or suggestions? We're always looking to improve 
                F1 Apex Predictions. Reach out and we'll get back to you as soon as possible.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-[#1F2833] rounded-lg border border-gray-700">
                <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center text-2xl">
                  📧
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Email</p>
                  <a href="mailto:contact@f1apex.com" className="text-white hover:text-red-500 transition font-mono">
                    contact@f1apex.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-[#1F2833] rounded-lg border border-gray-700">
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center text-2xl">
                  🐦
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Twitter/X</p>
                  <a href="https://twitter.com/f1apex" className="text-white hover:text-red-500 transition font-mono" target="_blank" rel="noopener noreferrer">
                    @f1apex
                  </a>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-red-900/20 to-transparent border-l-4 border-red-600 rounded-r-lg">
              <h3 className="text-white font-bold mb-2">Response Time</h3>
              <p className="text-gray-400 text-sm">
                We typically respond within 24-48 hours during race weekends. 
                For urgent issues, please include "URGENT" in your subject line.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-[#1F2833] p-8 rounded-xl border border-gray-700 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Send us a Message</h2>
            
            <form className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Your Name
                </label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-[#0B0C10] border border-gray-700 rounded text-white focus:border-red-500 outline-none transition"
                  placeholder="Lewis Hamilton"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <input 
                  type="email" 
                  className="w-full p-3 bg-[#0B0C10] border border-gray-700 rounded text-white focus:border-red-500 outline-none transition"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Subject
                </label>
                <select className="w-full p-3 bg-[#0B0C10] border border-gray-700 rounded text-white focus:border-red-500 outline-none transition">
                  <option value="">Select a topic...</option>
                  <option value="feedback">General Feedback</option>
                  <option value="bug">Report a Bug</option>
                  <option value="feature">Feature Request</option>
                  <option value="scoring">Scoring Question</option>
                  <option value="account">Account Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Message
                </label>
                <textarea 
                  className="w-full p-3 bg-[#0B0C10] border border-gray-700 rounded text-white focus:border-red-500 outline-none transition h-32 resize-none"
                  placeholder="Tell us what's on your mind..."
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700 transition shadow-[0_0_20px_rgba(220,38,38,0.3)] uppercase tracking-widest"
              >
                Send Message
              </button>
            </form>

            <p className="text-gray-600 text-xs mt-4 text-center">
              By submitting, you agree to our{" "}
              <Link href="/privacy" className="text-red-500 hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
