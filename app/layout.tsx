import '@/app/globals.css';
import Providers from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-space-bg text-slate-100 min-h-screen relative">
        {/* Warm radial ambient glows */}
        <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-rose-500/5 blur-[120px] rounded-full -translate-x-1/4 -translate-y-1/4" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4" />
        </div>
        <div className="relative z-10">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
