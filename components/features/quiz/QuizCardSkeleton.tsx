export default function QuizCardSkeleton() {
  return (
    <div className="animate-pulse bg-white/5 rounded-[2rem] border border-white/10 shadow-lg flex flex-col h-full">
      <div className="p-6 flex-1 flex flex-col">
        <div className="h-6 bg-white/10 rounded-md w-3/4 mb-4" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-white/10 rounded w-full" />
          <div className="h-3 bg-white/10 rounded w-5/6" />
          <div className="h-3 bg-white/10 rounded w-4/6" />
        </div>
        <div className="mt-6 h-12 bg-white/10 rounded-2xl w-full" />
      </div>
    </div>
  );
}