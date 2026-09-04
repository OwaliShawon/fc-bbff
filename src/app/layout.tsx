import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { NavigationLoader } from "@/components/navigation-loader";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FC BBFF - Bhai Brother Football Federation",
    template: "%s | FC BBFF",
  },
  description:
    "Official website of FC BBFF Football Club. Follow fixtures, results, news, and everything about the club.",
  keywords: ["football", "FC BBFF", "club", "matches", "players", "results"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Suspense fallback={null}>
          <NavigationLoader />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
