import { useState, useEffect } from 'react';
import { Trash2, ChevronLeft, ChevronRight, Heart, MessageCircle, Image, MoreHorizontal, Filter } from 'lucide-react';
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
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-zinc-600 border-t-zinc-200 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Posts</h1>
          <p className="text-sm text-zinc-500 mt-1">Moderate user content and activities</p>
        </div>
        <button className="h-9 w-9 flex items-center justify-center border border-[#27272a] rounded-md text-zinc-500 hover:text-white hover:bg-[#27272a] transition-colors">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Data Table */}
      <div className="border border-[#27272a] rounded-lg overflow-hidden bg-[#09090b]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#09090b] text-zinc-500 font-medium border-b border-[#27272a]">
              <tr>
                <th className="px-6 py-3 font-medium">Author</th>
                <th className="px-6 py-3 font-medium">Content</th>
                <th className="px-6 py-3 font-medium">Engagement</th>
                <th className="px-6 py-3 font-medium">Visibility</th>
                <th className="px-6 py-3 font-medium">Created</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {posts.map((post) => (
                <tr key={post._id} className="hover:bg-[#27272a]/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {post.userAvatar ? (
                        <img src={post.userAvatar} alt={post.userName} className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-zinc-800 transition-all" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-400">
                          {post.userName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">{post.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="flex items-center gap-3">
                      {(post.image || post.images?.length > 0) && (
                        <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                          <Image className="w-4 h-4 text-zinc-500" />
                        </div>
                      )}
                      <p className="text-zinc-400 truncate text-xs">{post.caption}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-zinc-500 text-xs">
                      <span className="flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5" /> {post.likesCount || 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5" /> {post.commentsCount || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                      post.visibility === 'Public' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                      {post.visibility}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 font-mono text-xs">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDelete(post._id)}
                        className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[#27272a] flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Page <span className="font-medium text-zinc-300">{pagination.page}</span> of <span className="font-medium text-zinc-300">{pagination.pages}</span>
          </p>
          <div className="flex items-center gap-1">
            <button 
              className="p-1.5 rounded border border-[#27272a] text-zinc-500 hover:text-white hover:bg-[#27272a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              className="p-1.5 rounded border border-[#27272a] text-zinc-500 hover:text-white hover:bg-[#27272a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={pagination.page === pagination.pages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Posts;
