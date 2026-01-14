import { Globe, Heart, Shield, Users } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="bg-white min-h-screen ">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-amber-500 to-amber-700 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
        </div>
        <div className="relative max-w-7xl mx-auto text-center mt-10">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl tracking-tight">
            About TravelBuddy
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-amber-100">
            Connecting travelers worldwide to create unforgettable memories and lasting friendships.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Our Mission
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
              We believe that travel is better when shared. Our mission is to build a global community
              where solo travelers can find companions, locals can share their culture, and everyone
              can explore the world with confidence and safety.
            </p>
          </div>
        </div>
      </div>

      {/* Values Grid */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Value 1 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Community First</h3>
              <p className="mt-2 text-base text-gray-500">
                Building meaningful connections between like-minded travelers.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Safety & Trust</h3>
              <p className="mt-2 text-base text-gray-500">
                Verified profiles and secure communication for peace of mind.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Global Reach</h3>
              <p className="mt-2 text-base text-gray-500">
                Access to a diverse network of travelers from every corner of the globe.
              </p>
            </div>

            {/* Value 4 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Passion for Travel</h3>
              <p className="mt-2 text-base text-gray-500">
                Driven by a shared love for exploration and cultural exchange.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Story / Join Section */}
      <div className="py-16 bg-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div className="mb-8 lg:mb-0">
               <div className="text-base font-semibold text-amber-600 tracking-wide uppercase">
                The Journey
              </div>
              <h3 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Created for Travelers, by Travelers
              </h3>
              <p className="mt-4 text-lg text-gray-500">
                TravelBuddy started with a simple idea: no one should have to explore alone if they don't want to.
                Whether you're looking for a hiking partner, a city guide, or just someone to share a meal with,
                our platform helps you find the perfect companion for your adventures.
              </p>
            </div>
             <div className="relative -mx-4 mt-10 lg:mt-0" aria-hidden="true">
               <svg
                  className="absolute left-1/2 transform -translate-x-1/2 translate-y-16 lg:hidden"
                  width={784}
                  height={404}
                  fill="none"
                  viewBox="0 0 784 404"
                >
                  <defs>
                    <pattern
                      id="e80155a9-dfde-425a-b5ea-1f6fadd20131"
                      x={0}
                      y={0}
                      width={20}
                      height={20}
                      patternUnits="userSpaceOnUse"
                    >
                      <rect x={0} y={0} width={4} height={4} className="text-gray-200" fill="currentColor" />
                    </pattern>
                  </defs>
                  <rect width={784} height={404} fill="url(#e80155a9-dfde-425a-b5ea-1f6fadd20131)" />
                </svg>
                 <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                    <div className="relative block w-full bg-white rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                        <img
                            className="w-full"
                            src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                            alt="People traveling together"
                        />
                         <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
                             {/* Overlay if needed */}
                         </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
