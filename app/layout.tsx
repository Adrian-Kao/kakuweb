import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PageTransitionProvider } from "../components/PageTransition";
import "./globals.css";

// Frontend font settings: these Next font imports control the public site's base font variables.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KAKU Photography",
  description: "Light reveals. Shadow remembers.",
  openGraph: {
    title: "KAKU Photography",
    description: "Light reveals. Shadow remembers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PageTransitionProvider>{children}</PageTransitionProvider>
      </body>
    </html>
  );
}
