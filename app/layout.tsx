import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

// DESIGN.md font substitutes: Inter ≈ figmaSans, JetBrains Mono ≈ figmaMono.
// Inter variable exercises the fine-grained weight axis (wght 100..900).
// Inter is a variable font — load the full axis (100–900) so we can
// exercise fine-grained weights (320/330/340/480/540) per DESIGN.md.
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
    "Create personalized quizzes, compete on leaderboards, and share real-time memories with your partner.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-canvas text-ink antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}