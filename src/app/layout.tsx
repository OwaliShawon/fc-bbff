import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BBFF FC - Football Club Management",
    template: "%s | BBFF FC",
  },
  description:
    "Official website of BBFF Football Club. Follow fixtures, results, news, and everything about the club.",
  keywords: ["football", "BBFF FC", "club", "matches", "players", "results"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
