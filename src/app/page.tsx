import Image from 'next/image';

export default function Home() {
  return (
    // Main background: Deep black with a subtle radial gradient for depth
    <div className="flex min-h-screen flex-col bg-black font-sans text-white selection:bg-indigo-500/30">
      
      {/* Navigation */}
      <nav className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-white/10 bg-black/50 px-8 py-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600"></div>
          <span className="text-xl font-bold tracking-tight">EventFlow</span>
        </div>
        <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition-transform hover:scale-105 active:scale-95">
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 pt-32 text-center">
        
        {/* Background Decorative Glow */}
        <div className="absolute top-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-indigo-600/20 blur-[120px]"></div>
        <div className="absolute bottom-1/4 -z-10 h-[250px] w-[250px] rounded-full bg-purple-600/10 blur-[100px]"></div>

        {/* Hero Content */}
        <div className="max-w-4xl space-y-8">
          <span className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-400">
            v2.0 is now live
          </span>
          
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
            Host events that <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              people actually love.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
            The all-in-one platform for seamless ticketing, attendee management, 
            and real-time analytics. Built for creators who demand perfection.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#"
              className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-full bg-indigo-600 px-8 font-bold transition-all hover:bg-indigo-500 sm:w-auto"
            >
              Start for Free
              <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
            </a>
            
            <a
              href="#"
              className="flex h-14 w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 font-semibold transition-colors hover:bg-white/10 sm:w-auto"
            >
              Watch Demo
            </a>
          </div>
        </div>

        {/* Mockup / Visual Element */}
        <div className="mt-20 w-full max-w-5xl px-4">
          <div className="relative rounded-2xl border border-white/10 bg-zinc-900/50 p-4 shadow-2xl backdrop-blur-sm">
            <div className="aspect-video w-full rounded-lg bg-zinc-800/50 flex items-center justify-center border border-white/5">
               <p className="text-zinc-500 italic">Dashboard Preview Mockup</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Social Proof */}
      <footer className="mt-20 border-t border-white/5 py-12 text-center text-zinc-500">
        <p className="text-sm">Trusted by 500+ global organizers</p>
      </footer>
    </div>
  );
}