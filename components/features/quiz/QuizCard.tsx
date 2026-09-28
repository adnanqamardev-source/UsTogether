import { type CSSProperties, useState } from "react";
import { Play, Trash2 } from "lucide-react";

type Quiz = {
  id: string;
  title: string;
  description: string;
  creatorId?: string;
  questions?: any[];
};

type QuizCardProps = {
  quiz: Quiz;
  onStart?: (quiz: Quiz) => void;
  onDelete?: (e: React.MouseEvent, quizId: string) => void;
  userId?: string;
};

export default function QuizCard({ quiz, onStart, onDelete, userId }: QuizCardProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="group relative rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:border-[#bcabae]/40 hover:shadow-[0_0_35px_rgba(188,171,174,)]"
      style={
        {
          "--tw-shadow-color": "rgba(188,171,174,)",
        } as CSSProperties
      }
    >
      {/* Animated gradient border on hover */}
      <div className={`absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} style={{ background: 'linear-gradient(135deg, rgba(188,171,174,), rgba(99,102,241,0.3))', padding: '1px', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
      {quiz.creatorId === userId && (
        <div className="absolute right-4 top-4 z-10">
          <button
            onClick={(e) => onDelete?.(e, quiz.id)}
            className="rounded-full p-2 text-white/30 transition-colors hover:text-[#bcabae] focus:outline-none"
            aria-label="Delete quiz"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-1 cursor-pointer flex-col gap-3" onClick={() => onStart?.(quiz)}>
        <h3 className="font-serif italic text-xl text-white transition-colors group-hover:text-[#bcabae]">
          {quiz.title}
        </h3>
        <p className="text-[#bcabae]/70 line-clamp-3 text-sm">{quiz.description}</p>
        <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#2d2e2e]/30 bg-gradient-to-r from-[#2d2e2e]/30 to-[#2d2e2e]/20 py-3 font-bold text-[#bcabae] transition-all group-hover:border-[#bcabae]/80 group-hover:from-[#bcabae]/50 group-hover:to-[#2d2e2e]/40">
          <Play className="h-4 w-4" />
          Start Quiz
        </button>
      </div>
    </div>
  );
}