import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Header() {
  const router = useRouter();
  
  const isActive = (path) => router.pathname === path;
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 mr-2">
                <svg viewBox="0 0 40 40" className="w-full h-full">
                  <circle cx="20" cy="20" r="18" fill="#10B981" />
                  <path d="M32 20C32 26.6274 26.6274 32 20 32C13.3726 32 8 26.6274 8 20C8 13.3726 13.3726 8 20 8" 
                    stroke="white" strokeWidth="3" strokeLinecap="round" />
                  <path d="M20 8C20 8 24 12 28 16M28 8L20 8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 32L24 26M20 32L16 26" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-primary font-bold text-xl">GreenRoute</span>
            </Link>
            <nav className="ml-6 flex space-x-8">
              <Link href="/" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/') ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}>
                Home
              </Link>
              <Link href="/carpool" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/carpool') ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}>
                Carpooling
              </Link>
              <Link href="/parking" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/parking') ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}>
                Parking
              </Link>
              <Link href="/about" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/about') ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}>
                About
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            <Link href="/login" className="btn btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 