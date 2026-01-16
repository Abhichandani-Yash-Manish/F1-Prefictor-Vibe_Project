import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | F1 Predictor League",
  description: "Terms of Service for F1 Apex Predictions - Rules and guidelines for using our platform.",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0B0C10] text-gray-300 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 border-b border-gray-800 pb-8">
          <Link href="/" className="text-red-500 hover:text-red-400 text-sm uppercase tracking-widest mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black font-orbitron text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-500">Last updated: January 2025</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-gray max-w-none space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using F1 Apex Predictions ("the Service"), you agree to be bound by these 
              Terms of Service. If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
            <p>
              F1 Apex Predictions is a free-to-play Formula 1 prediction game where users can predict 
              race outcomes and compete on leaderboards. The Service is provided for entertainment 
              purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
            <p>To use certain features of the Service, you must create an account. You agree to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Acceptable Use</h2>
            <p>You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Create multiple accounts to manipulate standings</li>
              <li>Use automated scripts or bots</li>
              <li>Harass, abuse, or harm other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Predictions & Scoring</h2>
            <p>
              All predictions must be submitted before the deadline (qualifying start time). 
              Late submissions will not be accepted. Scores are calculated automatically based on 
              our scoring system. We reserve the right to adjust scores in case of errors or disputes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by F1 Apex 
              Predictions and are protected by international copyright and trademark laws.
            </p>
            <p className="mt-4">
              Formula 1®, F1®, and related marks are trademarks of Formula One Licensing BV. 
              We are not affiliated with, endorsed by, or connected to Formula One, FIA, or any F1 team.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Third-Party Content</h2>
            <p>
              Our Service may display content from third parties, including advertisements. We are not 
              responsible for the content, accuracy, or opinions expressed in such third-party content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not guarantee that 
              the Service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
            <p>
              In no event shall F1 Apex Predictions be liable for any indirect, incidental, special, 
              consequential, or punitive damages arising out of your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account at any time, without prior 
              notice, for conduct that we believe violates these Terms or is harmful to other users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. We will notify users of any significant changes. 
              Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:{" "}
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
