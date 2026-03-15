import type { Metadata } from "next";
import { Syne } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Providers from "../components/providers";
import { Navigation } from "@/components/navigation";

const syne = Syne({ 
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "RemitAI - Compare Remittance Rates",
  description: "Find the best remittance rates in real-time.",
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
            <div className="flex-1 pb-16 md:pb-0">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
