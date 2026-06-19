import AuthWrapper from '@/components/AuthWrapper';
import LandingSections from '@/components/LandingSections';

export default function Page() {
  return (
    <AuthWrapper>
      <div className="flex-1 flex flex-col font-sans p-6 relative w-full min-h-screen max-w-6xl mx-auto noise-bg">
        <nav className="flex justify-between items-center mb-12 relative z-10 gap-4 mt-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <span className="font-bold text-xl text-white">U</span>
            </div>
            <span className="text-2xl font-light tracking-tight">Us<span className="font-bold">Together</span></span>
          </div>
        </nav>

        <main className="flex-1 flex flex-col items-center justify-center relative z-10 p-6 md:p-12">
          <LandingSections />
        </main>
        
        <footer className="mt-6 flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest relative z-10 border-t border-white/5 pt-4">
          <div>&copy; {new Date().getFullYear()} UsTogether. All rights reserved.</div>
        </footer>
      </div>
    </AuthWrapper>
  );
}
