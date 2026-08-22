import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_TC } from "next/font/google";
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

const sourceHanSans = Noto_Sans_TC({
  variable: "--font-source-han-sans",
  weight: ["400", "900"],
  display: "swap",
  preload: false,
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
      className={`${geistSans.variable} ${geistMono.variable} ${sourceHanSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PageTransitionProvider>{children}</PageTransitionProvider>
      </body>
    </html>
  );
}
