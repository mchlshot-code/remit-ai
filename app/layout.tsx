import type { Metadata } from "next";
import { Syne } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Providers from "../components/providers";

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
          <div className="flex min-h-screen flex-col">
            <header className="border-b h-16 flex items-center px-8 font-semibold">
              RemitAI
            </header>
            <div className="flex-1">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
