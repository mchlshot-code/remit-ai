import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "../components/providers";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={inter.className}>
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
