import Layout from '../components/Layout';

export default function AboutPage() {
  return (
    <Layout>
      <div className="bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-dark">About EcoCommute</h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our mission is to create sustainable transportation solutions that reduce carbon emissions and make commuting more efficient.
            </p>
          </div>

          {/* Our Vision */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-10">
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-gray-700 mb-4">
              At EcoCommute, we envision a world where transportation is sustainable, efficient, and community-focused. 
              We believe that by optimizing daily commutes through carpooling and smart parking, we can significantly 
              reduce carbon emissions while building stronger communities.
            </p>
            <p className="text-gray-700">
              Our platform is designed to make sustainable transportation choices easy and rewarding, helping individuals, 
              businesses, and cities work together toward a greener future.
            </p>
          </div>

          {/* Environmental Impact */}
          <div className="bg-gradient-to-r from-primary/90 to-primary/70 text-white rounded-lg shadow-md p-8 mb-10">
            <h2 className="text-2xl font-bold mb-4">Environmental Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-white/20 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mt-4">Reducing Carbon Footprint</h3>
                <p className="mt-2 text-white/90">
                  Each shared ride can reduce carbon emissions by up to 1kg CO2 per km compared to individual trips.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-white/20 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mt-4">Measuring Impact</h3>
                <p className="mt-2 text-white/90">
                  Our platform tracks and displays your personal and community environmental impact in real-time.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-white/20 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mt-4">Global Goals</h3>
                <p className="mt-2 text-white/90">
                  We're aligned with UN Sustainable Development Goals, particularly in urban sustainability and climate action.
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-10">
            <h2 className="text-2xl font-bold mb-6">How EcoCommute Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">Carpooling</h3>
                <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                  <li>Create your profile and set your regular commute routes</li>
                  <li>Choose whether you want to be a driver or passenger</li>
                  <li>Browse available carpools that match your route</li>
                  <li>Connect with potential carpool partners</li>
                  <li>Share rides and track your environmental impact</li>
                </ol>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">Smart Parking</h3>
                <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                  <li>Enter your destination and parking preferences</li>
                  <li>View available parking spots in real-time</li>
                  <li>Compare options based on price, location, and features</li>
                  <li>Reserve your spot in advance</li>
                  <li>Get guided navigation to your parking space</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Our Team */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-10">
            <h2 className="text-2xl font-bold mb-6">Our Team</h2>
            <p className="text-gray-700 mb-6">
              EcoCommute was founded by a passionate team of environmental advocates, transportation experts, and technology innovators. 
              We share a common goal of making sustainable transportation accessible and appealing to everyone.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Team members would go here in a real app */}
              <div className="text-center">
                <div className="bg-gray-200 rounded-full w-24 h-24 mx-auto mb-4"></div>
                <h3 className="font-semibold">Jane Smith</h3>
                <p className="text-gray-600 text-sm">CEO & Co-Founder</p>
              </div>
              <div className="text-center">
                <div className="bg-gray-200 rounded-full w-24 h-24 mx-auto mb-4"></div>
                <h3 className="font-semibold">John Doe</h3>
                <p className="text-gray-600 text-sm">CTO & Co-Founder</p>
              </div>
              <div className="text-center">
                <div className="bg-gray-200 rounded-full w-24 h-24 mx-auto mb-4"></div>
                <h3 className="font-semibold">Emma Johnson</h3>
                <p className="text-gray-600 text-sm">Head of Sustainability</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-dark rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-12 md:p-12 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Join the Sustainable Transportation Movement</h2>
              <p className="text-gray-300 max-w-2xl mx-auto mb-8">
                Be part of the solution to reduce carbon emissions, traffic congestion, and parking stress. 
                Join EcoCommute today and start making a positive impact on our environment.
              </p>
              <div className="flex flex-col md:flex-row justify-center gap-4">
                <a href="/register" className="btn bg-white text-dark hover:bg-gray-100">
                  Sign Up Now
                </a>
                <a href="/contact" className="btn border border-white text-white hover:bg-white/10">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 