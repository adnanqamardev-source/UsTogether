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
      <body className="relative min-h-screen bg-onyx text-white antialiased">
        <div className="noise-bg pointer-events-none fixed inset-0 -z-10" aria-hidden="true" />
        <div className="relative z-10">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
