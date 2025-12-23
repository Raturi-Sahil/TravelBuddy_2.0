import {
  BookOpen,
  Calendar,
  Edit,
  Eye,
  FileText,
  Globe,
  Heart,
  Loader2,
  Lock,
  MessageCircle,
  Save,
  Search,
  Trash2,
  Users,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';

import { fetchMyArticles, updateArticle, deleteArticle } from '../../redux/slices/articleSlice';

// Edit Modal Component
function EditArticleModal({ article, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: article.title || '',
    content: article.content || '',
    category: article.category || 'Travel Tips',
    visibility: article.visibility || 'Public',
  });

  const categories = ["Destination Guide", "Travel Tips", "Budget Travel", "Digital Nomad", "Sustainable Travel", "Food & Culture", "Photography", "Adventure"];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Edit size={24} className="text-amber-600" />
            Edit Article
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
              <FileText size={18} className="text-amber-600" />
              Article Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter article title..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
              <BookOpen size={18} className="text-amber-600" />
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your article content..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none transition-all duration-200"
              rows={8}
              required
            />
            <p className="text-xs text-gray-500 text-right">
              {formData.content.length} characters
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
              <BookOpen size={18} className="text-amber-600" />
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
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

function ManageArticle() {
  const dispatch = useDispatch();
  const { getToken } = useAuth();

  const { myArticles, isLoading, isUpdating, isDeleting, error } = useSelector((state) => state.article);
  const [editingArticle, setEditingArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Fetch user's articles on mount
  useEffect(() => {
    dispatch(fetchMyArticles({ getToken, page: 1, limit: 100 }));
  }, [dispatch, getToken]);

  // Filter articles
  const filteredArticles = myArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVisibility = filterVisibility === 'All' || article.visibility === filterVisibility;
    const matchesStatus = filterStatus === 'All' || article.status === filterStatus;

    return matchesSearch && matchesVisibility && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: myArticles.length,
    published: myArticles.filter(a => a.status === 'Published').length,
    draft: myArticles.filter(a => a.status === 'Draft').length,
    public: myArticles.filter(a => a.visibility === 'Public').length,
    totalViews: myArticles.reduce((sum, a) => sum + (a.views || 0), 0),
    totalLikes: myArticles.reduce((sum, a) => sum + (a.likesCount || 0), 0),
  };

  // Handle edit
  const handleEditArticle = async (updatedData) => {
    try {
      await dispatch(updateArticle({
        getToken,
        id: editingArticle._id,
        updateData: updatedData
      })).unwrap();

      toast.success('Article updated successfully! ✨');
      setEditingArticle(null);

      // Refresh articles
      dispatch(fetchMyArticles({ getToken, page: 1, limit: 100 }));
    } catch (err) {
      toast.error(err || 'Failed to update article');
    }
  };

  // Handle delete
  const handleDeleteArticle = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    try {
      await dispatch(deleteArticle({ getToken, id: articleId })).unwrap();
      toast.success('Article deleted successfully! 🗑️');
    } catch (err) {
      toast.error(err || 'Failed to delete article');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-28 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full mb-4">
            <FileText className="text-amber-600" size={20} />
            <span className="text-amber-700 font-semibold text-sm">Article Management</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
            Manage Your Articles
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Edit, publish, and organize your travel articles
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Articles', value: stats.total, icon: FileText, color: 'amber' },
            { label: 'Published', value: stats.published, icon: BookOpen, color: 'green' },
            { label: 'Drafts', value: stats.draft, icon: Edit, color: 'gray' },
            { label: 'Public', value: stats.public, icon: Globe, color: 'blue' },
            { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'purple' },
            { label: 'Total Likes', value: stats.totalLikes, icon: Heart, color: 'red' },
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
          <div className="flex flex-col gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, content, or category..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="flex gap-2">
                <span className="text-sm font-semibold text-gray-700 self-center">Visibility:</span>
                {['All', 'Public', 'Friends', 'Private'].map((visibility) => (
                  <button
                    key={visibility}
                    onClick={() => setFilterVisibility(visibility)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                      filterVisibility === visibility
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {visibility}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <span className="text-sm font-semibold text-gray-700 self-center">Status:</span>
                {['All', 'Published', 'Draft'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                      filterStatus === status
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <Loader2 className="animate-spin mx-auto mb-4 text-amber-600" size={48} />
            <p className="text-gray-600 text-lg">Loading your articles...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-20">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <FileText className="text-red-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Articles</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => dispatch(fetchMyArticles({ getToken, page: 1, limit: 100 }))}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Articles Grid */}
        {!isLoading && !error && filteredArticles.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <FileText className="text-amber-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterVisibility !== 'All' || filterStatus !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Start writing your first article!'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <div
                key={article._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Cover Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />

                  {/* Status & Visibility Badges */}
                  <div className="absolute top-2 left-2 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                      article.status === 'Published'
                        ? 'bg-green-500/90 text-white'
                        : 'bg-gray-700/90 text-white'
                    }`}>
                      {article.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                      article.visibility === 'Public' ? 'bg-blue-500/90 text-white' :
                      article.visibility === 'Friends' ? 'bg-purple-500/90 text-white' :
                      'bg-gray-700/90 text-white'
                    }`}>
                      <div className="flex items-center gap-1">
                        {article.visibility === 'Public' && <Globe size={12} />}
                        {article.visibility === 'Friends' && <Users size={12} />}
                        {article.visibility === 'Private' && <Lock size={12} />}
                        <span>{article.visibility}</span>
                      </div>
                    </span>
                  </div>

                  {/* Action Buttons Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => setEditingArticle(article)}
                      className="p-3 bg-white rounded-full hover:bg-amber-500 hover:text-white transition-all duration-200 transform hover:scale-110"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(article._id)}
                      disabled={isDeleting}
                      className="p-3 bg-white rounded-full hover:bg-red-500 hover:text-white transition-all duration-200 transform hover:scale-110 disabled:opacity-50"
                    >
                      {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  {/* Category */}
                  <span className="inline-block bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {article.category}
                  </span>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Content Preview */}
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {article.content}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Eye size={16} className="text-blue-500" />
                      <span className="font-semibold">{article.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Heart size={16} className="text-red-500" />
                      <span className="font-semibold">{article.likesCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <MessageCircle size={16} className="text-green-500" />
                      <span className="font-semibold">{article.commentsCount || 0}</span>
                    </div>
                  </div>

                  {/* Date & Read Time */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{formatDate(article.createdAt)}</span>
                    </div>
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Result Count */}
        {filteredArticles.length > 0 && !isLoading && (
          <div className="text-center mt-8 text-sm text-gray-500">
            Showing {filteredArticles.length} of {myArticles.length} articles
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingArticle && (
        <EditArticleModal
          article={editingArticle}
          onClose={() => setEditingArticle(null)}
          onSave={handleEditArticle}
        />
      )}
    </div>
  );
}

export default ManageArticle;
