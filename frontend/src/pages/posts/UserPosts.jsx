import { useAuth } from '@clerk/clerk-react';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Share2,
  Upload,
  Sparkles,
  Send,
  Clock
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { fetchPosts, toggleLike, incrementShare, addComment } from '../../redux/slices/postSlice';

// Premium Image Carousel Component
function ImageCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative w-full h-full group">
      <img
        src={images[currentIndex]}
        alt={`Image ${currentIndex + 1}`}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/600x600?text=Image+Not+Found';
        }}
      />

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-110"
          >
            <ChevronLeft size={18} className="text-gray-800" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-110"
          >
            <ChevronRight size={18} className="text-gray-800" />
          </button>

          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {currentIndex + 1}/{images.length}
          </div>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-white w-5'
                    : 'bg-white/50 hover:bg-white/80 w-1.5'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function UserPosts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const { posts, isLoading, pagination, error } = useSelector((state) => state.post);
  const [currentPage, setCurrentPage] = useState(1);
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [likeAnimation, setLikeAnimation] = useState({});

  useEffect(() => {
    dispatch(fetchPosts({
      getToken,
      page: currentPage,
      limit: 12,
      visibility: 'Public'
    }));
  }, [dispatch, getToken, currentPage]);

  const handleLike = async (postId) => {
    setLikeAnimation(prev => ({ ...prev, [postId]: true }));
    setTimeout(() => setLikeAnimation(prev => ({ ...prev, [postId]: false })), 800);

    try {
      const result = await dispatch(toggleLike({ getToken, id: postId })).unwrap();
      toast.success(result.data.liked ? '❤️ Liked!' : 'Unliked');
      dispatch(fetchPosts({ getToken, page: currentPage, limit: 12, visibility: 'Public' }));
    } catch (err) {
      toast.error('Failed to update like');
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleAddComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await dispatch(addComment({ getToken, id: postId, text })).unwrap();
      toast.success('Comment added! 💬');
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      dispatch(fetchPosts({ getToken, page: currentPage, limit: 12, visibility: 'Public' }));
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const handleShare = async (postId, postCaption) => {
    try {
      await dispatch(incrementShare({ getToken, id: postId }));

      // Create the specific post URL
      const postUrl = `${window.location.origin}/post/${postId}`;

      if (navigator.share) {
        await navigator.share({
          title: 'Check out this travel story!',
          text: postCaption,
          url: postUrl,
        });
      } else {
        await navigator.clipboard.writeText(postUrl);
        toast.success('Post link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleLoadMore = () => {
    if (pagination.hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleDoubleClick = (postId) => {
    if (!likeAnimation[postId]) {
      handleLike(postId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 mb-4">
            <Sparkles className="text-amber-500" size={18} />
            <span className="text-gray-700 font-medium text-sm">Travel Community</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
            Explore Travel <span className="text-amber-600">Moments</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Discover inspiring stories from travelers around the world
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-8 text-center">
            <p className="text-red-600">⚠️ {error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && currentPage === 1 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading stories...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-24 h-24 bg-amber-50 rounded-3xl flex items-center justify-center mb-6">
              <Camera className="text-amber-500" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500 mb-6">Be the first to share your adventure!</p>
            <button
              onClick={() => navigate('/upload-post')}
              className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-semibold"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <>
            {/* Posts Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <article
                  key={post._id}
                  className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-amber-100 transition-all duration-300 hover:-translate-y-1 group"
                  style={{ backgroundColor: '#FEF7ED' }}
                >
                  {/* Card Header */}
                  <div className="p-4 flex items-center border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={post.userAvatar || 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'}
                          alt={post.userName}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{post.userName}</h3>
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <Clock size={11} />
                          <span>{formatTimestamp(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Section */}
                  <div
                    className="relative aspect-[4/5] bg-gray-100 cursor-pointer overflow-hidden"
                    onDoubleClick={() => handleDoubleClick(post._id)}
                  >
                    {post.images && post.images.length > 0 ? (
                      <ImageCarousel images={post.images} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <Camera className="text-gray-300" size={48} />
                      </div>
                    )}

                    {/* Like Animation */}
                    {likeAnimation[post._id] && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10">
                        <Heart
                          className="text-white fill-white drop-shadow-2xl animate-ping"
                          size={80}
                        />
                      </div>
                    )}

                    {/* Location Badge */}
                    {post.location?.name && (
                      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
                        <MapPin size={13} className="text-amber-600" />
                        <span className="text-xs font-medium text-gray-700 max-w-[120px] truncate">
                          {post.location.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 mb-3">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`p-2 rounded-xl transition-all duration-200 ${
                          post.likes?.includes(post.userId)
                            ? 'text-red-500 bg-red-50'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Heart
                          size={22}
                          className={post.likes?.includes(post.userId) ? 'fill-current' : ''}
                        />
                      </button>
                      <button
                        onClick={() => toggleComments(post._id)}
                        className={`p-2 rounded-xl transition-all duration-200 ${
                          showComments[post._id]
                            ? 'text-amber-600 bg-amber-50'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <MessageCircle size={22} />
                      </button>
                      <button
                        onClick={() => handleShare(post._id, post.caption)}
                        className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-200"
                      >
                        <Share2 size={22} />
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <span className="font-semibold text-gray-900">{post.likesCount || 0} likes</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">{post.commentsCount || 0} comments</span>
                    </div>

                    {/* Caption */}
                    <div className="max-h-16 overflow-y-auto hide-scrollbar mb-3">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-semibold text-gray-900">{post.userName}</span>{' '}
                        {post.caption}
                      </p>
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.tags.slice(0, 4).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full hover:bg-amber-100 hover:text-amber-700 transition-colors cursor-pointer"
                          >
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 4 && (
                          <span className="text-xs text-gray-400 px-2 py-1">
                            +{post.tags.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Comments Section */}
                    {showComments[post._id] && (
                      <div className="pt-3 border-t border-gray-100 space-y-3">
                        {post.comments && post.comments.length > 0 && (
                          <div className="space-y-2.5 max-h-36 overflow-y-auto hide-scrollbar">
                            {post.comments.map((comment, idx) => (
                              <div key={idx} className="flex gap-2.5">
                                <img
                                  src={comment.userAvatar || 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'}
                                  alt=""
                                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                                  <p className="text-xs font-semibold text-gray-900">{comment.userName}</p>
                                  <p className="text-xs text-gray-600">{comment.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={commentText[post._id] || ''}
                            onChange={(e) => setCommentText(prev => ({
                              ...prev,
                              [post._id]: e.target.value
                            }))}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleAddComment(post._id);
                            }}
                            placeholder="Add a comment..."
                            className="flex-1 px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition-all placeholder:text-gray-400"
                          />
                          <button
                            onClick={() => handleAddComment(post._id)}
                            className="px-4 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* Load More */}
            {pagination.hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>Load More Posts</>
                  )}
                </button>
              </div>
            )}

            {/* Pagination Info */}
            <div className="text-center mt-6 text-sm text-gray-400">
              Showing {posts.length} of {pagination.totalPosts || 0} posts
            </div>
          </>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/upload-post')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center z-50"
      >
        <Upload size={24} />
      </button>

      {/* Stats Footer */}
      <div className="max-w-7xl mx-auto mt-16">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Stories', value: pagination.totalPosts || 0, color: 'amber' },
            { label: 'Current Page', value: pagination.currentPage || 1, color: 'blue' },
            { label: 'Total Pages', value: pagination.totalPages || 1, color: 'emerald' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
              <p className={`text-3xl font-bold text-${stat.color}-600 mb-1`}>{stat.value}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserPosts;
