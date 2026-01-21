import type { Metadata } from "next";
import Link from "next/link";
import FeedbackForm from "@/app/components/FeedbackForm";

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
                  <a href="mailto:yashraj2507@gmail.com" className="text-white hover:text-red-500 transition font-mono">
                    yashraj2507@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-[#1F2833] rounded-lg border border-gray-700">
                <div className="w-12 h-12 bg-pink-600/20 rounded-full flex items-center justify-center text-2xl">
                  📸
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Instagram</p>
                  <a href="https://www.instagram.com/yash.it.is._/" className="text-white hover:text-red-500 transition font-mono" target="_blank" rel="noopener noreferrer">
                    @yash.it.is._
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
          <FeedbackForm />
        </div>
      </div>
    </div>
  );
}
