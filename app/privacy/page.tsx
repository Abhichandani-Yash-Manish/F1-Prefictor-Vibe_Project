import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | F1 Predictor League",
  description: "Privacy Policy for F1 Apex Predictions - Learn how we collect, use, and protect your data.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0B0C10] text-gray-300 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 border-b border-gray-800 pb-8">
          <Link href="/" className="text-red-500 hover:text-red-400 text-sm uppercase tracking-widest mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black font-orbitron text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-500">Last updated: January 2025</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-gray max-w-none space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to F1 Apex Predictions ("we," "our," or "us"). We are committed to protecting your 
              personal information and your right to privacy. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you visit our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Account Information:</strong> Email address and password when you create an account</li>
              <li><strong>Prediction Data:</strong> Your race predictions and scores</li>
              <li><strong>Usage Data:</strong> Information about how you use our website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your predictions and calculate scores</li>
              <li>Display leaderboards and standings</li>
              <li>Send you updates about races and your predictions</li>
              <li>Respond to your comments and questions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Advertising</h2>
            <p>
              We may use third-party advertising companies to serve ads when you visit our website. 
              These companies may use information about your visits to this and other websites to 
              provide advertisements about goods and services of interest to you.
            </p>
            <p className="mt-4">
              We use Google AdSense to display advertisements. Google uses cookies to serve ads based 
              on a user's prior visits to our website or other websites. You can opt out of personalized 
              advertising by visiting{" "}
              <a href="https://www.google.com/settings/ads" className="text-red-500 hover:text-red-400" target="_blank" rel="noopener noreferrer">
                Google Ads Settings
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our website. 
              Cookies are files with a small amount of data that are sent to your browser from a 
              website and stored on your device.
            </p>
            <p className="mt-4">Types of cookies we use:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
              <li><strong>Advertising Cookies:</strong> Used to deliver relevant advertisements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal 
              information. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Third-Party Services</h2>
            <p>Our website uses the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Supabase:</strong> For authentication and database services</li>
              <li><strong>Google AdSense:</strong> For displaying advertisements</li>
              <li><strong>Jolpica API:</strong> For Formula 1 race data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:{" "}
              <a href="mailto:contact@f1apex.com" className="text-red-500 hover:text-red-400">
                contact@f1apex.com
              </a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
