import { useAuth } from '@clerk/clerk-react';
import {
  Calendar,
  Camera,
  ChevronLeft,
  ChevronRight,
  Edit,
  Globe,
  Heart,
  Image as ImageIcon,
  Loader2,
  Lock,
  MapPin,
  MessageCircle,
  Save,
  Search,
  Share2,
  Tag,
  Trash2,
  Users,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';

import { deletePost, fetchMyPosts, updatePost } from '../../redux/slices/postSlice';

// Image Carousel Component
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
        className="w-full h-full object-cover transition-opacity duration-300"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
        }}
      />

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <ChevronRight size={16} />
          </button>

          <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium">
            {currentIndex + 1} / {images.length}
          </div>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-white w-3'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Edit Modal Component
function EditPostModal({ post, onClose, onSave }) {
  const [formData, setFormData] = useState({
    caption: post.caption || '',
    tags: post.tags || [],
    visibility: post.visibility || 'Public',
    locationName: post.location?.name || '',
  });
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Edit size={24} className="text-amber-600" />
            Edit Post
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Caption */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
              <Camera size={18} className="text-amber-600" />
              Caption
            </label>
            <textarea
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              placeholder="Update your caption..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none transition-all duration-200"
              rows={4}
              maxLength={2000}
              required
            />
            <p className="text-xs text-gray-500 text-right">
              {formData.caption.length}/2000 characters
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
              <MapPin size={18} className="text-amber-600" />
              Location
            </label>
            <input
              type="text"
              value={formData.locationName}
              onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
              placeholder="Add or update location..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
              <Tag size={18} className="text-amber-600" />
              Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tags (press Enter)"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Add
              </button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:bg-amber-200 rounded-full p-0.5 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Visibility */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
              <Globe size={18} className="text-amber-600" />
              Who can see this?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'Public', icon: Globe, label: 'Public', desc: 'Everyone' },
                { value: 'Friends', icon: Users, label: 'Friends', desc: 'Friends only' },
                { value: 'Private', icon: Lock, label: 'Private', desc: 'Only me' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, visibility: option.value })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.visibility === option.value
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <option.icon
                    size={24}
                    className={`mx-auto mb-2 ${
                      formData.visibility === option.value ? 'text-amber-600' : 'text-gray-400'
                    }`}
                  />
                  <p className="font-semibold text-sm">{option.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
            >
              <Save size={20} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ManagePost() {
  const dispatch = useDispatch();
  const { getToken } = useAuth();

  const { myPosts, isLoading, isUpdating, isDeleting, error } = useSelector((state) => state.post);
  const [editingPost, setEditingPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('All');

  // Fetch user's own posts
  useEffect(() => {
    dispatch(fetchMyPosts({
      getToken,
      page: 1,
      limit: 100
    }));
  }, [dispatch, getToken]);

  // Format timestamp
  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle edit post
  const handleEditPost = async (updatedData) => {
    try {
      await dispatch(updatePost({
        getToken,
        id: editingPost._id,
        updateData: updatedData
      })).unwrap();

      toast.success('Post updated successfully! ✨');
      setEditingPost(null);

      // Refresh posts
      dispatch(fetchMyPosts({
        getToken,
        page: 1,
        limit: 100
      }));
    } catch (err) {
      toast.error(err || 'Failed to update post');
    }
  };

  // Handle delete post
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      await dispatch(deletePost({ getToken, id: postId })).unwrap();
      toast.success('Post deleted successfully! 🗑️');

      // Refresh posts
      dispatch(fetchMyPosts({
        getToken,
        page: 1,
        limit: 100
      }));
    } catch (err) {
      toast.error(err || 'Failed to delete post');
    }
  };

  // Filter posts based on search and visibility
  const filteredPosts = myPosts.filter(post => {
    const matchesSearch = post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.location?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesVisibility = filterVisibility === 'All' || post.visibility === filterVisibility;

    return matchesSearch && matchesVisibility;
  });

  // Calculate stats
  const stats = {
    total: myPosts.length,
    public: myPosts.filter(p => p.visibility === 'Public').length,
    friends: myPosts.filter(p => p.visibility === 'Friends').length,
    private: myPosts.filter(p => p.visibility === 'Private').length,
    totalLikes: myPosts.reduce((sum, p) => sum + (p.likesCount || 0), 0),
    totalComments: myPosts.reduce((sum, p) => sum + (p.commentsCount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-28 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full mb-4">
            <ImageIcon className="text-amber-600" size={20} />
            <span className="text-amber-700 font-semibold text-sm">Post Management</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
            Manage Your Posts
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Edit, delete, and organize your travel memories
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Posts', value: stats.total, icon: ImageIcon, color: 'amber' },
            { label: 'Public', value: stats.public, icon: Globe, color: 'blue' },
            { label: 'Friends', value: stats.friends, icon: Users, color: 'purple' },
            { label: 'Private', value: stats.private, icon: Lock, color: 'gray' },
            { label: 'Total Likes', value: stats.totalLikes, icon: Heart, color: 'red' },
            { label: 'Comments', value: stats.totalComments, icon: MessageCircle, color: 'green' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className={`bg-${stat.color}-100 w-10 h-10 rounded-lg flex items-center justify-center mb-2`}>
                <stat.icon className={`text-${stat.color}-600`} size={20} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-gray-600 text-xs">{stat.label}</p>
            </div>
          ))}
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
                placeholder="Search by caption, location, or tags..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>

            {/* Visibility Filter */}
            <div className="flex gap-2">
              {['All', 'Public', 'Friends', 'Private'].map((visibility) => (
                <button
                  key={visibility}
                  onClick={() => setFilterVisibility(visibility)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    filterVisibility === visibility
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {visibility}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-red-600 font-medium">⚠️ {error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-amber-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading your posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mb-4">
              <Camera className="text-amber-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery || filterVisibility !== 'All' ? 'No posts found' : 'No posts yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterVisibility !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Start sharing your travel adventures!'}
            </p>
          </div>
        ) : (
          // Posts Grid
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPosts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {post.images && post.images.length > 0 ? (
                    <ImageCarousel images={post.images} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <Camera className="text-gray-400" size={48} />
                    </div>
                  )}

                  {/* Visibility Badge */}
                  <div className="absolute top-2 left-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                      post.visibility === 'Public' ? 'bg-green-500/90 text-white' :
                      post.visibility === 'Friends' ? 'bg-purple-500/90 text-white' :
                      'bg-gray-700/90 text-white'
                    }`}>
                      <div className="flex items-center gap-1">
                        {post.visibility === 'Public' && <Globe size={12} />}
                        {post.visibility === 'Friends' && <Users size={12} />}
                        {post.visibility === 'Private' && <Lock size={12} />}
                        <span>{post.visibility}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => setEditingPost(post)}
                      className="p-3 bg-white rounded-full hover:bg-amber-500 hover:text-white transition-all duration-200 transform hover:scale-110"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      disabled={isDeleting}
                      className="p-3 bg-white rounded-full hover:bg-red-500 hover:text-white transition-all duration-200 transform hover:scale-110 disabled:opacity-50"
                    >
                      {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Heart size={16} className="text-red-500" />
                      <span className="font-semibold">{post.likesCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <MessageCircle size={16} className="text-blue-500" />
                      <span className="font-semibold">{post.commentsCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Share2 size={16} className="text-green-500" />
                      <span className="font-semibold">{post.shares || 0}</span>
                    </div>
                  </div>

                  {/* Location */}
                  {post.location?.name && (
                    <div className="flex items-center gap-1 text-amber-600">
                      <MapPin size={14} />
                      <span className="text-sm font-medium truncate">{post.location.name}</span>
                    </div>
                  )}

                  {/* Caption */}
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                    {post.caption}
                  </p>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                      {post.tags.length > 2 && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                          +{post.tags.length - 2} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="flex items-center gap-1 text-gray-400 text-xs pt-2 border-t border-gray-100">
                    <Calendar size={12} />
                    <span>{formatTimestamp(post.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Result Count */}
        {filteredPosts.length > 0 && (
          <div className="text-center mt-8 text-sm text-gray-500">
            Showing {filteredPosts.length} of {myPosts.length} posts
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={handleEditPost}
        />
      )}

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
            <p className="text-gray-700 font-semibold">Updating post...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagePost;
