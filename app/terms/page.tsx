'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function TermsOfService() {
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
            <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground italic">Last Updated: {lastUpdated}</p>
          </header>

          <section className="space-y-12">
            <div>
              <h2 className="text-2xl font-display font-bold mb-4 text-emerald-500">1. Acceptance of Terms</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                By accessing or using RemitAI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold mb-4 text-emerald-500">2. Service Description</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                RemitAI is a comparison tool designed to help users identify the best remittance rates for specific currency corridors. <span className="font-bold text-foreground">RemitAI is not a money transfer service.</span> We do not process, handle, or store any funds or bank account details.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold mb-4 text-emerald-500">3. Information for Reference Only</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Exchange rates, fees, and transfer speeds displayed on RemitAI are fetched from third-party providers and are intended for reference purposes only. <span className="font-bold text-foreground underline italic">Users must verify all information directly on the provider&apos;s website before initiating any transfer.</span>
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold mb-4 text-emerald-500">4. No Guarantee of Accuracy</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Currency markets are highly volatile. While we strive to provide real-time data, we cannot guarantee the complete accuracy, reliability, or timeliness of the information displayed.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold mb-4 text-emerald-500">5. Rate Alerts</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Rate alerts are &quot;best-effort&quot; notifications. Delays in data fetching or email delivery may occur. RemitAI is not responsible for any missed opportunities resulting from delayed or failed alert notifications.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold mb-4 text-emerald-500">6. Limitation of Liability</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                RemitAI and its operators are not liable for any financial losses or damages arising from transfer decisions made based on the data provided by our tools. All transfer risks are solely assumed by the user.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold mb-4 text-emerald-500">7. Service Availability</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                We reserve the right to interrupt or discontinue our services at any time without prior notice.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold mb-4 text-emerald-500">8. Governing Law</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                These terms are governed by the laws of <span className="font-bold text-foreground">Nigeria</span>. Any disputes arising from the use of RemitAI shall be subject to the exclusive jurisdiction of the courts in Nigeria.
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
