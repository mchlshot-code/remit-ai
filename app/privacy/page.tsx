'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PrivacyPolicy() {
  const lastUpdated = "March 2026";

  return (
    <main className="min-h-screen bg-background text-foreground py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground italic">Last Updated: {lastUpdated}</p>
          </header>

          <section className="space-y-12">
            <div>
              <h2 className="text-2xl font-display font-bold mb-4 text-emerald-500">1. Introduction</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                At RemitAI, your privacy is our priority. This policy outlines how we handle your data when you use our comparison tools and rate alert services. We believe in radical transparency and minimal data footprint.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold mb-4 text-emerald-500">2. What Data We Collect</h2>
              <ul className="list-disc pl-6 space-y-3 text-lg text-muted-foreground">
                <li>
                  <span className="font-bold text-foreground">Email Address</span>: Collected via Google OAuth when you sign in to set rate alerts.
                </li>
                <li>
                  <span className="font-bold text-foreground">Rate Alert Preferences</span>: The specific currency corridors and target exchange rates you wish to monitor.
                </li>
                <li>
                  <span className="font-bold text-foreground">Chat History</span>: Anonymous logs of AI assistant interactions (non-personally identifiable).
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold mb-4 text-emerald-500">3. How We Use Your Data</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                We use your email address <span className="underline italic">only</span> to send automated notifications when your requested exchange rates are met. We do not use your email for marketing, newsletters, or any other unsolicited communication.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold mb-4 text-emerald-500">4. What We Don&apos;t Do</h2>
              <ul className="list-disc pl-6 space-y-3 text-lg text-muted-foreground">
                <li>We <span className="font-bold text-foreground uppercase underline">never</span> sell your data to third parties.</li>
                <li>We do not use invasive tracking pixels or cross-site behavioral advertising.</li>
                <li>We do not store your financial or bank account details.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold mb-4 text-emerald-500">5. Third-Party Services</h2>
              <p className="text-lg leading-relaxed text-muted-foreground mb-4">
                We rely on trusted infrastructure partners to provide our services:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-lg text-muted-foreground">
                <li><span className="font-bold text-foreground">Supabase</span>: For secure authentication and storing your alert preferences.</li>
                <li><span className="font-bold text-foreground">Groq</span>: For powering our AI Assistant logic.</li>
                <li><span className="font-bold text-foreground">Resend</span>: For the reliable delivery of your rate alert emails.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold mb-4 text-emerald-500">6. Contact Us</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                If you have any questions about this policy or wish to have your data deleted, please contact us at: <span className="font-bold text-foreground">your@gmail.com</span>
              </p>
            </div>
          </section>

          <footer className="mt-20 pt-8 border-t border-border flex justify-center">
            <Link 
              href="/" 
              className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors"
            >
              &larr; Back to Home
            </Link>
          </footer>
        </motion.div>
      </div>
    </main>
  );
}
