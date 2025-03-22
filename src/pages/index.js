import Layout from '../components/Layout';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Sustainable Transportation for a Greener Future
              </h1>
              <p className="mt-4 text-lg text-white/90">
                EcoCommute helps you reduce your carbon footprint through optimized carpooling and smart parking solutions.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/carpool" className="btn bg-white text-primary hover:bg-gray-100">
                  Find a Carpool
                </Link>
                <Link href="/parking" className="btn bg-secondary text-white hover:bg-secondary/90">
                  Find Parking
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              {/* Replace with an actual image */}
              <div className="aspect-w-4 aspect-h-3 rounded-lg bg-white/10 flex items-center justify-center p-8">
                <div className="text-center">
                  <svg className="w-24 h-24 mx-auto text-white/80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="mt-4 text-white/90">Illustration: Carpooling and sustainable transportation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-dark">Our Features</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              EcoCommute provides innovative solutions to make your daily commute more efficient and eco-friendly.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Carpooling Feature */}
            <div className="card transition-all hover:shadow-lg">
              <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mt-4">Carpooling Optimization</h3>
              <p className="text-gray-600 mt-2">
                Connect with colleagues and neighbors to share rides, save money, and reduce emissions.
              </p>
              <Link href="/carpool" className="mt-4 inline-block text-primary hover:underline">
                Learn more &rarr;
              </Link>
            </div>

            {/* Parking Feature */}
            <div className="card transition-all hover:shadow-lg">
              <div className="rounded-full bg-secondary/10 p-3 w-12 h-12 flex items-center justify-center">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mt-4">Smart Parking Finder</h3>
              <p className="text-gray-600 mt-2">
                Locate available parking spaces in busy urban areas, saving time and reducing fuel consumption.
              </p>
              <Link href="/parking" className="mt-4 inline-block text-secondary hover:underline">
                Learn more &rarr;
              </Link>
            </div>

            {/* Environmental Impact Feature */}
            <div className="card transition-all hover:shadow-lg">
              <div className="rounded-full bg-green-100 p-3 w-12 h-12 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mt-4">Environmental Impact</h3>
              <p className="text-gray-600 mt-2">
                Track your carbon footprint reduction and contributions to a greener environment.
              </p>
              <Link href="/impact" className="mt-4 inline-block text-green-600 hover:underline">
                Learn more &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-dark rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-12 md:p-12 text-center md:text-left md:flex md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Ready to transform your commute?</h2>
                <p className="mt-2 text-gray-300">
                  Join thousands of users making a positive impact on our environment.
                </p>
              </div>
              <div className="mt-8 md:mt-0 flex flex-col md:flex-row gap-4">
                <Link href="/register" className="btn bg-white text-dark hover:bg-gray-100">
                  Sign Up for Free
                </Link>
                <Link href="/about" className="btn border border-white text-white hover:bg-white/10">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
} 