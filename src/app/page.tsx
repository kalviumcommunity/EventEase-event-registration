import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white transition-colors">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 px-8 py-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand"></div>
          <span className="text-xl font-bold tracking-tight">EventEase</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 pt-32">
        <div className="max-w-4xl space-y-8">
          {/* Mobile: Stack vertically, text-center */}
          <div className="flex flex-col items-center text-center lg:flex-row lg:items-start lg:text-left lg:justify-between">
            <div className="space-y-4 lg:space-y-6">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                Welcome to EventEase
              </h1>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400 sm:text-xl lg:mx-0">
                The all-in-one platform for seamless event management,
                ticketing, and attendee analytics.
              </p>
            </div>
            {/* Desktop: Horizontal flex/grid, text-left */}
            <div className="hidden lg:block lg:ml-8">
              <div className="w-64 h-64 bg-brand rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl font-bold">EventEase</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
