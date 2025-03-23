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