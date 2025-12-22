import { Camera, Heart, MapPin, MessageCircle, Share2, User } from 'lucide-react';
import React, { useState } from 'react';

// Dummy data for travel stories
const dummyPosts = [
  {
    id: 1,
    user: {
      name: "Sarah Johnson",
      avatar: "https://i.pravatar.cc/150?img=1",
      location: "New York, USA"
    },
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    caption: "Mountain sunrise in the Swiss Alps! The view was absolutely breathtaking. Hiked for 3 hours to catch this moment. Worth every step! ⛰️",
    location: "Swiss Alps, Switzerland",
    likes: 234,
    comments: 45,
    timestamp: "2 hours ago"
  },
  {
    id: 2,
    user: {
      name: "Michael Chen",
      avatar: "https://i.pravatar.cc/150?img=12",
      location: "Tokyo, Japan"
    },
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=600&fit=crop",
    caption: "Exploring the ancient temples of Kyoto. The serenity and beauty of these places is unmatched. Highly recommend visiting during cherry blossom season! 🌸",
    location: "Kyoto, Japan",
    likes: 567,
    comments: 89,
    timestamp: "5 hours ago"
  },
  {
    id: 3,
    user: {
      name: "Emma Rodriguez",
      avatar: "https://i.pravatar.cc/150?img=5",
      location: "Barcelona, Spain"
    },
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
    caption: "Sunset at Santorini never gets old! The blue domes, white buildings, and golden hour light create pure magic. Already planning my next visit! 💙",
    location: "Santorini, Greece",
    likes: 892,
    comments: 123,
    timestamp: "1 day ago"
  },
  {
    id: 4,
    user: {
      name: "David Kumar",
      avatar: "https://i.pravatar.cc/150?img=8",
      location: "Mumbai, India"
    },
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop",
    caption: "Backpacking through the Norwegian fjords has been a dream come true. The landscapes are otherworldly and the hiking trails are incredible!",
    location: "Bergen, Norway",
    likes: 445,
    comments: 67,
    timestamp: "2 days ago"
  },
  {
    id: 5,
    user: {
      name: "Lisa Anderson",
      avatar: "https://i.pravatar.cc/150?img=9",
      location: "London, UK"
    },
    image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&h=600&fit=crop",
    caption: "Paradise found in the Maldives! Crystal clear waters, white sandy beaches, and the most stunning sunsets. This is what vacation dreams are made of! 🏝️",
    location: "Maldives",
    likes: 1203,
    comments: 156,
    timestamp: "3 days ago"
  },
  {
    id: 6,
    user: {
      name: "Alex Martinez",
      avatar: "https://i.pravatar.cc/150?img=13",
      location: "Mexico City, Mexico"
    },
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
    caption: "Exploring the charming streets of Paris at night. The Eiffel Tower sparkles and the city comes alive with magic. Je t'aime Paris! ❤️",
    location: "Paris, France",
    likes: 678,
    comments: 92,
    timestamp: "4 days ago"
  }
];

function UserPosts() {
  const [posts, setPosts] = useState(dummyPosts);
  const [likedPosts, setLikedPosts] = useState(new Set());

  const handleLike = (postId) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(postId)) {
        newLiked.delete(postId);
        // Decrement like count
        setPosts(posts.map(post =>
          post.id === postId ? { ...post, likes: post.likes - 1 } : post
        ));
      } else {
        newLiked.add(postId);
        // Increment like count
        setPosts(posts.map(post =>
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
        ));
      }
      return newLiked;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-28 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full mb-4">
            <Camera className="text-amber-600" size={20} />
            <span className="text-amber-700 font-semibold text-sm">Travel Stories</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
            Explore Travel Moments
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover amazing travel experiences shared by our community of adventurers
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* User Header */}
              <div className="p-4 flex items-center gap-3 border-b border-gray-100">
                <img
                  src={post.user.avatar}
                  alt={post.user.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-100"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{post.user.name}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin size={12} />
                    {post.user.location}
                  </p>
                </div>
              </div>

              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={post.image}
                  alt={post.caption}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Actions Bar */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <Heart
                      size={22}
                      className={likedPosts.has(post.id) ? 'fill-red-500 text-red-500' : ''}
                    />
                    <span className="text-sm font-semibold">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-600 hover:text-amber-600 transition-colors">
                    <MessageCircle size={22} />
                    <span className="text-sm font-semibold">{post.comments}</span>
                  </button>
                  <button className="ml-auto text-gray-600 hover:text-amber-600 transition-colors">
                    <Share2 size={22} />
                  </button>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 text-amber-600">
                  <MapPin size={14} />
                  <span className="text-sm font-medium">{post.location}</span>
                </div>

                {/* Caption */}
                <p className="text-gray-700 text-sm leading-relaxed">
                  {post.caption}
                </p>

                {/* Timestamp */}
                <p className="text-xs text-gray-400">{post.timestamp}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Create Post Button (Fixed) */}
        <button className="fixed bottom-8 right-8 bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-full shadow-2xl shadow-amber-500/30 hover:scale-110 transition-all duration-300 z-50 group">
          <Camera size={24} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Share Your Story
          </span>
        </button>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-3 gap-6">
          {[
            { label: 'Total Stories', value: '1,234', icon: Camera },
            { label: 'Active Travelers', value: '567', icon: User },
            { label: 'Countries Visited', value: '89', icon: MapPin }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
              <div className="bg-amber-100 w-12 h-12 rounded-xl flex items-center justify-center mb-3 mx-auto">
                <stat.icon className="text-amber-600" size={24} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserPosts;
