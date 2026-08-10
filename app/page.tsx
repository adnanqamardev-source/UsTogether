import { Logo } from "@/components/ui/Logo";
import { ColorBlock } from "@/components/ui/ColorBlock";
import { Button } from "@/components/ui/Button";

export default function Page() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* ---- Nav (top-nav: white bar, 56px) ---- */}
      <nav className="sticky top-0 z-10 bg-canvas border-b border-hairline">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-2">
            <Button variant="secondary">Contact</Button>
            <Button>Get started</Button>
          </div>
        </div>
      </nav>

      {/* ---- Marquee strip (inverse-canvas) ---- */}
      <div className="bg-inverse-canvas text-inverse-ink h-9 flex items-center overflow-hidden">
        <div className="flex gap-8 whitespace-nowrap animate-pulse px-6 caption">
          <span>QUIZZES</span>
          <span>MEMORIES</span>
          <span>CHAT</span>
          <span>LEADERBOARDS</span>
          <span>AI PROMPTS</span>
          <span>REAL-TIME</span>
          <span>CONNECTION</span>
        </div>
      </div>

      {/* ---- Hero (white canvas) ---- */}
      <main className="max-w-7xl mx-auto px-6 py-24 flex flex-col items-center text-center gap-10">
        <h1 className="max-w-3xl text-5xl md:text-7xl font-light tracking-tight leading-[1.05] weight-subhead">
          How well do you <span className="italic">really</span> know each other?
        </h1>
        <p className="max-w-xl text-xl font-light text-ink/70 weight-body-lg">
          Create personalized quizzes, compete together, and capture the memories
          that make your story yours.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button>Get started for free</Button>
          <Button variant="secondary">Explore features</Button>
        </div>
      </main>

      {/* ---- Color-block sections (pastel rhythm) ---- */}
      <div className="max-w-3xl mx-auto px-6 space-y-24 py-24">
        {/* lilac — quizzes */}
        <ColorBlock color="lilac">
          <p className="eyebrow text-sm opacity-70 mb-4">QUIZZES</p>
          <h2 className="text-3xl font-light tracking-tight mb-4 weight-headline">
            Built for two, in real time.
          </h2>
          <p className="text-lg font-light text-ink/80 mb-6 weight-body">
            Challenge your partner to a quiz and watch the answers sync across
            both of your screens the moment they land.
          </p>
          <Button variant="secondary">Start a quiz</Button>
        </ColorBlock>

        {/* lime — AI challenges */}
        <ColorBlock color="lime">
          <p className="eyebrow text-sm opacity-70 mb-4">AI PROMPTS</p>
          <h2 className="text-3xl font-light tracking-tight mb-4 weight-headline">
            Personalized to your story.
          </h2>
          <p className="text-lg font-light text-ink/80 mb-6 weight-body">
            An AI that reads your shared answers and proposes challenges tuned
            to what you actually care about.
          </p>
          <Button variant="secondary">Try an AI challenge</Button>
        </ColorBlock>

        {/* mint — memories */}
        <ColorBlock color="mint">
          <p className="eyebrow text-sm opacity-70 mb-4">MEMORIES</p>
          <h2 className="text-3xl font-light tracking-tight mb-4 weight-headline">
            Keep the good stuff.
          </h2>
          <p className="text-lg font-light text-ink/80 mb-6 weight-body">
            Look back on every finished quiz and the answers that made you smile.
          </p>
          <Button variant="secondary">Browse memories</Button>
        </ColorBlock>
      </div>

      {/* ---- Footer (inverse-canvas) ---- */}
      <footer className="bg-inverse-canvas text-inverse-ink mt-24">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <Logo inverse />
            <p className="mt-4 text-sm text-inverse-ink/60 max-w-xs">
              A space for two, made for the moments that matter.
            </p>
          </div>
          <div>
            <p className="caption text-inverse-ink/40 mb-4">PRODUCT</p>
            <ul className="space-y-2 text-sm">
              <li>Quizzes</li>
              <li>Memories</li>
              <li>Chat</li>
            </ul>
          </div>
          <div>
            <p className="caption text-inverse-ink/40 mb-4">COMPANY</p>
            <ul className="space-y-2 text-sm">
              <li>About</li>
              <li>Contact</li>
              <li>Privacy</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pb-8 caption text-inverse-ink/40">
          © {new Date().getFullYear()} UsTogether. All rights reserved.
        </div>
      </footer>
    </div>
  );
}