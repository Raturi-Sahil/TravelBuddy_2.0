import { useState, useEffect } from 'react';
import { Trash2, ChevronLeft, ChevronRight, Eye, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { getArticles, deleteArticle } from '../services/api';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchArticles();
  }, [pagination.page]);

  const fetchArticles = async () => {
    try {
      const response = await getArticles({ page: pagination.page, limit: 10 });
      setArticles(response.data.data.articles);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    
    try {
      await deleteArticle(id);
      toast.success('Article deleted successfully');
      fetchArticles();
    } catch (error) {
      toast.error('Failed to delete article');
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
          <h1 className="text-3xl font-bold text-white">Articles</h1>
          <p className="text-zinc-500 mt-1">{pagination.total} total articles</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#16162a]/60 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1e1e3f]">
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Author</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Title</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Category</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Views</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Created</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article._id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {article.userAvatar ? (
                        <img src={article.userAvatar} alt={article.userName} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                          {article.userName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-white">{article.userName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 max-w-xs">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                      <p className="text-white font-medium truncate">{article.title}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                      {article.category}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      article.status === 'Published' 
                        ? 'bg-green-500/10 text-green-400' 
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <Eye className="w-4 h-4" />
                      {article.views || 0}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-zinc-500">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <button 
                      onClick={() => handleDelete(article._id)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
                      title="Delete Article"
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

export default Articles;
