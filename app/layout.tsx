import type { Metadata, Viewport } from "next";
import { Syne } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Providers from "../components/providers";
import { Navigation } from "@/components/navigation";
import { InstallPrompt } from "@/components/install-prompt";
import Link from 'next/link';

const syne = Syne({ 
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#00C985",
};

export const metadata: Metadata = {
  title: "RemitAI - Compare Remittance Rates",
  description: "Find the best remittance rates in real-time.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RemitAI",
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: "c630bc1fae49648a",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${syne.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          <div className="flex min-h-screen flex-col font-sans">
            <Navigation />
            <InstallPrompt />
            <div className="flex-1 pb-16 md:pb-0">
              {children}
            </div>
            <footer className="w-full py-8 border-t border-border mt-auto">
              <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                <p>© {new Date().getFullYear()} RemitAI. All rights reserved.</p>
                <div className="flex gap-6">
                  <Link href="/privacy" className="hover:text-emerald-500 transition-colors">
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="hover:text-emerald-500 transition-colors">
                    Terms of Service
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
