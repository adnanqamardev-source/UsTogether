import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UsTogether — How well do you know each other?",
  description:
    "Create personalized quizzes, compete in real-time, and capture the moments that make your relationship unforgettable.",
  keywords: [
    "couples",
    "relationship app",
    "date ideas",
    "shared memories",
    "relationship quiz",
    "couple activities",
  ],
  openGraph: {
    title: "UsTogether",
    description:
      "A playful relationship app for deeper connection, shared memories, and everyday rituals.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UsTogether",
    description:
      "Turn your story into a daily ritual of connection, memories, and playful competition.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="relative min-h-screen bg-editorial text-[#18131d] antialiased selection:bg-rose-200/60">
        <div className="noise-bg pointer-events-none fixed inset-0 -z-10 opacity-80" aria-hidden="true" />

        <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
          <div className="absolute -left-20 top-0 h-[28rem] w-[28rem] rounded-full bg-rose-300/30 blur-[120px]" />
          <div className="absolute right-0 top-20 h-[30rem] w-[30rem] rounded-full bg-indigo-300/25 blur-[130px]" />
          <div className="absolute bottom-0 left-1/3 h-[22rem] w-[22rem] rounded-full bg-amber-200/25 blur-[100px]" />
        </div>

        <div className="relative z-10">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
