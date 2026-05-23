import '@/app/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-space-bg text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
