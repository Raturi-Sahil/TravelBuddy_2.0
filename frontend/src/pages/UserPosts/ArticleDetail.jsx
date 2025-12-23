import { useAuth } from '@clerk/clerk-react';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Eye,
  Heart,
  Loader2,
  MessageCircle,
  Share2,
  User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchArticleById, toggleArticleLike, addArticleComment, incrementArticleShare } from '../../redux/slices/articleSlice';

function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getToken } = useAuth();

  const { currentArticle, isLoading, error } = useSelector((state) => state.article);
  const [comment, setComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchArticleById({ getToken, id }));
    }
  }, [dispatch, getToken, id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleLike = async () => {
    try {
      await dispatch(toggleArticleLike({ getToken, id })).unwrap();
    } catch (err) {
      toast.error('Failed to like article');
    }
  };

  const handleShare = async () => {
    try {
      await dispatch(incrementArticleShare({ getToken, id })).unwrap();

      // Copy link to clipboard
      const articleUrl = window.location.href;
      await navigator.clipboard.writeText(articleUrl);
      toast.success('Link copied to clipboard! 🔗');
    } catch (err) {
      toast.error('Failed to share article');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsCommenting(true);
    try {
      await dispatch(addArticleComment({ getToken, id, commentData: { text: comment } })).unwrap();
      setComment('');
      toast.success('Comment added! 💬');
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setIsCommenting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-28 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-amber-600" size={48} />
          <p className="text-gray-600 text-lg">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !currentArticle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto">
            <BookOpen className="text-red-600" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h3>
          <p className="text-gray-600 mb-6">{error || 'This article may have been deleted or does not exist.'}</p>
          <button
            onClick={() => navigate('/read-article')}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold inline-flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  const article = currentArticle;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/read-article')}
          className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Back to Articles
        </button>

        {/* Article Card */}
        <article className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Cover Image */}
          {article.coverImage && (
            <div className="relative h-96 overflow-hidden">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Category Badge */}
              <div className="absolute top-6 left-6">
                <span className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  {article.category}
                </span>
              </div>
            </div>
          )}

          {/* Article Content */}
          <div className="p-8 md:p-12">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Author Info & Meta */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <img
                  src={article.userAvatar || 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'}
                  alt={article.userName}
                  className="w-14 h-14 rounded-full ring-4 ring-amber-100"
                />
                <div>
                  <p className="font-bold text-lg text-gray-900">{article.userName}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(article.createdAt || article.publishedAt)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {article.readTime}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {(article.views || 0).toLocaleString()} views
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Excerpt */}
            {article.excerpt && (
              <div className="mb-8 p-6 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl">
                <p className="text-lg text-gray-700 italic leading-relaxed">
                  {article.excerpt}
                </p>
              </div>
            )}

            {/* Main Content */}
            <div className="prose prose-lg max-w-none mb-8">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-justify">
                {article.content}
              </div>
            </div>

            {/* Additional Images */}
            {article.images && article.images.length > 1 && (
              <div className="mb-8 grid grid-cols-2 gap-4">
                {article.images.slice(1).map((image, idx) => (
                  <img
                    key={idx}
                    src={image}
                    alt={`Article image ${idx + 2}`}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                ))}
              </div>
            )}

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mb-8 flex flex-wrap gap-2">
                {article.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-amber-100 hover:text-amber-700 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Engagement Bar */}
            <div className="flex items-center justify-between py-6 border-y border-gray-200 mb-8">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors group"
                >
                  <Heart
                    size={24}
                    className={`${article.likes?.includes('current-user-id') ? 'fill-red-500 text-red-500' : 'group-hover:fill-red-500'}`}
                  />
                  <span className="font-semibold">{article.likesCount || 0}</span>
                </button>

                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors">
                  <MessageCircle size={24} />
                  <span className="font-semibold">{article.commentsCount || 0}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition-colors"
                >
                  <Share2 size={24} />
                  <span className="font-semibold">Share</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-gray-500">
                <Eye size={20} />
                <span className="font-semibold">{(article.views || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Comments Section */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Comments ({article.commentsCount || 0})
              </h3>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="mb-8">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
                  />
                  <button
                    type="submit"
                    disabled={isCommenting || !comment.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isCommenting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Posting...
                      </>
                    ) : (
                      'Post'
                    )}
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {article.comments && article.comments.length > 0 ? (
                  article.comments.map((comment) => (
                    <div key={comment._id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-start gap-3">
                        <img
                          src={comment.userAvatar || 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'}
                          alt={comment.userName}
                          className="w-10 h-10 rounded-full ring-2 ring-amber-100"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{comment.userName}</p>
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageCircle className="mx-auto mb-3 opacity-50" size={48} />
                    <p>No comments yet. Be the first to comment!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Reading Info Card */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="text-amber-600" size={20} />
            Article Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <Eye className="mx-auto mb-2 text-blue-500" size={24} />
              <p className="text-2xl font-bold text-gray-900">{(article.views || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-600">Views</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <Heart className="mx-auto mb-2 text-red-500" size={24} />
              <p className="text-2xl font-bold text-gray-900">{article.likesCount || 0}</p>
              <p className="text-xs text-gray-600">Likes</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <MessageCircle className="mx-auto mb-2 text-green-500" size={24} />
              <p className="text-2xl font-bold text-gray-900">{article.commentsCount || 0}</p>
              <p className="text-xs text-gray-600">Comments</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <Clock className="mx-auto mb-2 text-purple-500" size={24} />
              <p className="text-2xl font-bold text-gray-900">{article.readTime}</p>
              <p className="text-xs text-gray-600">Read Time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArticleDetail;
