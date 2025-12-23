import {
  BookOpen,
  Calendar,
  Camera,
  Clock,
  Eye,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Search,
  Share2,
  TrendingUp,
  User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';

import { fetchArticles } from '../../redux/slices/articleSlice';

const categories = ["All", "Destination Guide", "Travel Tips", "Budget Travel", "Digital Nomad", "Sustainable Travel", "Food & Culture", "Photography", "Adventure"];

function ReadArticle() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const { articles, isLoading, error } = useSelector((state) => state.article);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch articles on component mount
  useEffect(() => {
    dispatch(fetchArticles({
      getToken,
      page: 1,
      limit: 100,
      status: 'Published'
    }));
  }, [dispatch, getToken]);

  // Filter articles based on search and category
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticles = filteredArticles.filter(a => a.featured);
  const regularArticles = filteredArticles.filter(a => !a.featured);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-28 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full mb-4">
            <BookOpen className="text-amber-600" size={20} />
            <span className="text-amber-700 font-semibold text-sm">Travel Articles</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
            Explore Stories & Guides
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover inspiring travel stories, expert guides, and tips from travelers around the world
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title or content..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-amber-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Featured Articles</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredArticles.map((article) => (
                <div
                  key={article._id}
                  onClick={() => navigate(`/article/${article._id}`)}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                >
                  {/* Cover Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Featured
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Author Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={article.userAvatar || 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'}
                        alt={article.userName}
                        className="w-10 h-10 rounded-full ring-2 ring-amber-100"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{article.userName}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(article.createdAt || article.publishedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {article.readTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Title & Excerpt */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-amber-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {article.excerpt}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye size={16} className="text-blue-500" />
                        {(article.views || 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={16} className="text-red-500" />
                        {article.likesCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={16} className="text-green-500" />
                        {article.commentsCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Articles */}
        {regularArticles.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="text-amber-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Latest Articles</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularArticles.map((article) => (
                <div
                  key={article._id}
                  onClick={() => navigate(`/article/${article._id}`)}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                >
                  {/* Cover Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Author Info */}
                    <div className="flex items-center gap-2 mb-3">
                      <img
                        src={article.userAvatar || 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'}
                        alt={article.userName}
                        className="w-8 h-8 rounded-full ring-2 ring-amber-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{article.userName}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{formatDate(article.createdAt || article.publishedAt)}</span>
                          <span>•</span>
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Title & Excerpt */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {article.excerpt}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye size={14} className="text-blue-500" />
                        {(article.views || 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={14} className="text-red-500" />
                        {article.likesCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={14} className="text-green-500" />
                        {article.commentsCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <Loader2 className="animate-spin mx-auto mb-4 text-amber-600" size={48} />
            <p className="text-gray-600 text-lg">Loading articles...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-20">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <BookOpen className="text-red-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Articles</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => dispatch(fetchArticles({ getToken, page: 1, limit: 100, status: 'Published' }))}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && filteredArticles.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <BookOpen className="text-amber-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your search or filters'
                : 'No articles available yet. Be the first to publish!'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Stats Section */}
        {!isLoading && articles.length > 0 && (
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Articles', value: articles.length, icon: BookOpen },
              { label: 'Total Views', value: articles.reduce((sum, a) => sum + (a.views || 0), 0).toLocaleString(), icon: Eye },
              { label: 'Total Likes', value: articles.reduce((sum, a) => sum + (a.likesCount || 0), 0).toLocaleString(), icon: Heart },
              { label: 'Total Comments', value: articles.reduce((sum, a) => sum + (a.commentsCount || 0), 0), icon: MessageCircle }
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
        )}
      </div>
    </div>
  );
}

export default ReadArticle;
