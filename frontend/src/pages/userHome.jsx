import { useUser } from "@clerk/clerk-react";
import {
  ArrowRight,
  Calendar,
  Camera,
  ChevronRight,
  Compass,
  Heart,
  MapPin,
  MessageCircle,
  Play,
  Shield,
  Star,
  Users,
  Zap} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import CurrentLocationMap from '../components/currentLocation';



const heroSlides = [
  {
    title: 'Sunrise summit meetups',
    subtitle: 'Climb iconic peaks and share alpine brews with trekkers across Nepal & Patagonia.',
    location: 'Annapurna Base Camp • Nepal',
    travelers: '78 trekkers confirmed',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=80'
  },
  {
    title: 'Mediterranean sail weeks',
    subtitle: 'Skippers, creators, and remote workers hopping Greek & Croatian islands together.',
    location: 'Hvar • Croatia',
    travelers: '42 crew spots left',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=80'
  },
  {
    title: 'Desert stargazing retreats',
    subtitle:
      'Disconnect under Morocco’s crystal skies with photographers, yogis, and technomads.',
    location: 'Merzouga • Morocco',
    travelers: '59 creatives on board',
    image:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2400&q=80'
  }
];

const meetupSpots = [
  {
    city: 'Kyoto, Japan',
    theme: 'Temple Hopping & Café Crawl',
    date: 'March 28 • 18:00 JST',
    image:
      'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=2000&q=80'
  },
  {
    city: 'Lisbon, Portugal',
    theme: 'Remote Work Rooftop Mixer',
    date: 'April 04 • 19:30 WEST',
    image:
      'https://images.unsplash.com/photo-1464790719320-516ecd75af6c?auto=format&fit=crop&w=2000&q=80'
  },
  {
    city: 'Banff, Canada',
    theme: 'Frozen Lakes Photo Walk',
    date: 'April 11 • 09:00 MST',
    image:
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=2000&q=80'
  }
];

function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const[currentLocation, setCurrentLocation] = useState(null);
  const updateLocation = ()=>{
    navigator.geolocation.getCurrentPosition((position) => {
      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  }
  const { user,isSignedIn } = useUser();

  useEffect(() => {
    updateLocation();
  }, []);
  useEffect(() => {
    const interval = setInterval(
      () => setActiveSlide((prev) => (prev + 1) % heroSlides.length),
      6000
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActiveFeature((prev) => (prev + 1) % 3), 4000);
    return () => clearInterval(timer);
  }, []);

  const testimonials = useMemo(
    () => [
      {
        name: 'Sarah Chen',
        location: 'Tokyo, Japan',
        text: 'Found my travel squad for Southeast Asia through TravelBuddy. Best decision ever!',
        avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80'
      },
      {
        name: 'Marcus Rodriguez',
        location: 'Barcelona, Spain',
        text: 'Met incredible people and discovered hidden gems I never would have found alone.',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80'
      },
      {
        name: 'Emma Thompson',
        location: 'Sydney, Australia',
        text: 'From solo traveler to part of an amazing global community. Love this platform!',
        avatar: 'https://images.unsplash.com/photo-1544723795-432537f3bffe?auto=format&fit=crop&w=200&q=80'
      }
    ],
    []
  );

  if (!isSignedIn) {
    return <div className="flex justify-center items-center min-h-screen">Please login first.</div>;
  }

  const features = [
    {
      icon: <Compass className="h-8 w-8" />,
      title: 'Smart Matching',
      description:
        'AI connects you with compatible travelers based on interests, budget, vibes, and routes.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Trust & Safety',
      description: 'Verified IDs, reputation scores, and 24/7 concierge support in 23 countries.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Seamless Planning',
      description: 'Shared itineraries, split payments, live chat, and cloud-stored travel docs.',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center">
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            backgroundImage: `linear-gradient(120deg, rgba(2,6,23,0.85) 0%, rgba(2,6,23,0.4) 60%), url(${heroSlides[activeSlide].image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-12">
          <div>
            <div className="inline-flex items-center bg-white/10 text-white text-xs uppercase tracking-[0.3em] px-4 py-2 rounded-full mb-6">
              <Zap className="h-4 w-4 mr-2 text-amber-400" />
              50K+ travelers synced live
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              {heroSlides[activeSlide].title}
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-2xl">{heroSlides[activeSlide].subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button className="flex items-center justify-center px-8 py-4 rounded-full font-semibold bg-gradient-to-r from-amber-400 to-rose-500 text-gray-900 hover:scale-105 transition-transform">
                Start Your Journey
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
              <button className="flex items-center justify-center px-8 py-4 rounded-full border border-white/30 hover:border-white transition-colors">
                <Play className="mr-2 h-5 w-5" />
                Watch Story
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-amber-300" />
                {heroSlides[activeSlide].location}
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-300" />
                {heroSlides[activeSlide].travelers}
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-300" />
                4.9/5 Trustpilot score
              </div>
            </div>
            <div className="flex gap-2 mt-10">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === activeSlide ? 'w-10 bg-white' : 'w-4 bg-white/40'
                  }`}
                ></button>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
            <p className="text-sm text-white/60 mb-3 uppercase tracking-[0.3em]">Live meetup</p>
            <h3 className="text-2xl font-semibold mb-4">Tokyo Night Riders</h3>
            <p className="text-white/70 mb-6">
              Shibuya to Odaiba midnight cycle + ramen crawl with local creators and remote workers.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/5 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-amber-300" />
                  <span>Fri, 22 March • 8:30 PM JST</span>
                </div>
                <span className="text-emerald-300 text-sm font-medium">12 spots left</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-rose-300" />
                  <span>Live chat • Photosets • Route GPX</span>
                </div>
                <ArrowRight className="h-5 w-5 text-white/60" />
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((avatar) => (
                  <img
                    key={avatar}
                    src={`https://i.pravatar.cc/120?img=${avatar + 5}`}
                    alt="traveler"
                    className="w-12 h-12 rounded-full border-2 border-gray-950"
                  />
                ))}
              </div>
              <span className="text-sm text-white/70">+83 travelers in this circle</span>
            </div>
          </div>
        </div>
      </section>

      {/* Meetup carousel */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-amber-300 text-xs uppercase tracking-[0.3em] mb-2">Meetups</p>
              <h2 className="text-3xl font-bold">Curated travel circles this month</h2>
            </div>
            <button className="hidden sm:flex items-center gap-2 text-sm text-white/70 hover:text-white">
              View calendar
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {meetupSpots.map((spot) => (
              <div
                key={spot.city}
                className="group rounded-3xl overflow-hidden bg-white/5 border border-white/5 shadow-xl transition-transform hover:-translate-y-2"
              >
                <div
                  className="h-60 bg-cover bg-center"
                  style={{ backgroundImage: `url(${spot.image})` }}
                >
                  <div className="h-full w-full bg-gradient-to-t from-black/70 to-transparent p-6 flex flex-col justify-end">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/70 mb-2">City</p>
                    <h3 className="text-2xl font-semibold">{spot.city}</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Camera className="h-4 w-4 text-emerald-300" />
                    {spot.date}
                  </div>
                  <p className="text-lg">{spot.theme}</p>
                  <button className="inline-flex items-center gap-2 text-sm text-amber-300">
                    Request invite
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live map */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-amber-300 text-xs uppercase tracking-[0.3em] mb-2">Live map</p>
            <h2 className="text-4xl font-bold text-white mb-4">
              Active travelers
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {' '}
                near you
              </span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Share your location securely and discover people within 20 km planning similar routes.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-1">
              <div className="h-[520px] rounded-[1.5rem] overflow-hidden">
                <CurrentLocationMap lat={currentLocation?.lat} lng={currentLocation?.lng} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-amber-300 text-xs uppercase tracking-[0.3em] mb-2">Why TravelBuddy</p>
            <h2 className="text-4xl font-bold">Simple tools. Trusted people.</h2>
            <p className="text-lg text-white/60 mt-2">Everything you need to travel together.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`p-8 rounded-3xl border border-white/10 transition-all ${
                  activeFeature === index
                    ? 'bg-gradient-to-br ' + feature.color + ' text-white shadow-2xl'
                    : 'bg-white/5 text-white/80 hover:bg-white/10'
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white/10 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-amber-300 text-xs uppercase tracking-[0.3em] mb-2">Testimonials</p>
            <h2 className="text-4xl font-bold">Loved by travelers worldwide</h2>
            <p className="text-lg text-white/60 mt-2">Real stories from our community</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-lg"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <p className="font-semibold text-lg">{testimonial.name}</p>
                    <p className="text-sm text-white/60">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-white/80 leading-relaxed mb-4">"{testimonial.text}"</p>
                <div className="flex text-amber-300">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-amber-400/10 blur-3xl" />
        <div className="relative z-10 max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <p className="text-amber-300 text-xs uppercase tracking-[0.3em] mb-4">Join the movement</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to start your next adventure?
          </h2>
          <p className="text-white/70 text-lg max-w-3xl mx-auto mb-10">
            TravelBuddy creates curated circles for every travel style. Plan faster, meet safer, and
            make every city feel like home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group bg-gradient-to-r from-amber-400 to-rose-500 text-gray-900 px-10 py-4 rounded-full font-semibold text-lg transition-transform hover:scale-105 flex items-center justify-center">
              Join TravelBuddy Free
              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-10 py-4 rounded-full border border-white/30 hover:border-white text-lg">
              Explore community stories
            </button>
          </div>
          <div className="flex items-center justify-center gap-3 text-sm text-white/50 mt-8">
            <Shield className="h-4 w-4" />
            <span>Free forever • No credit card required • Verified profiles only</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;