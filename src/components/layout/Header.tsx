import Link from 'next/link';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  return (
    <header
      className={`bg-white shadow-sm border-b ${className || ''}`}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              EventEase
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </Link>
            <Link
              href="/login"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/users/1"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              User Profile
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
