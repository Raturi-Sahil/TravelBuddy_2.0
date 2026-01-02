import { useState, useEffect } from 'react';
import { Trash2, ChevronLeft, ChevronRight, Heart, MessageCircle, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPosts, deletePost } from '../services/api';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchPosts();
  }, [pagination.page]);

  const fetchPosts = async () => {
    try {
      const response = await getPosts({ page: pagination.page, limit: 10 });
      setPosts(response.data.data.posts);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await deletePost(id);
      toast.success('Post deleted successfully');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Posts</h1>
          <p className="text-zinc-500 mt-1">{pagination.total} total posts</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#16162a]/60 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1e1e3f]">
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Author</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Content</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Engagement</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Visibility</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Created</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post._id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {post.userAvatar ? (
                        <img src={post.userAvatar} alt={post.userName} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                          {post.userName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-white">{post.userName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 max-w-xs">
                    <div className="flex items-center gap-2">
                      {(post.image || post.images?.length > 0) && (
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                          <Image className="w-4 h-4 text-zinc-500" />
                        </div>
                      )}
                      <p className="text-zinc-400 truncate">{post.caption}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4 text-zinc-500">
                      <span className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4" /> {post.likesCount || 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4" /> {post.commentsCount || 0}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      post.visibility === 'Public' 
                        ? 'bg-green-500/10 text-green-400' 
                        : 'bg-zinc-500/10 text-zinc-400'
                    }`}>
                      {post.visibility}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-zinc-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <button 
                      onClick={() => handleDelete(post._id)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
                      title="Delete Post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 py-6 border-t border-white/5">
          <button 
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                pagination.page === page
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10'
              }`}
              onClick={() => setPagination(prev => ({ ...prev, page }))}
            >
              {page}
            </button>
          ))}
          <button 
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Posts;
