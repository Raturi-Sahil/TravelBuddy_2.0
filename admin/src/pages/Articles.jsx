import { useState, useEffect } from 'react';
import { Trash2, ChevronLeft, ChevronRight, Eye, BookOpen, Filter } from 'lucide-react';
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
          <h1 className="text-xl font-semibold text-white">Articles</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage articles and publications</p>
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
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Views</th>
                <th className="px-6 py-3 font-medium">Created</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {articles.map((article) => (
                <tr key={article._id} className="hover:bg-[#27272a]/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {article.userAvatar ? (
                        <img src={article.userAvatar} alt={article.userName} className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-zinc-800 transition-all" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-400">
                          {article.userName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">{article.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                      <p className="text-zinc-300 font-medium truncate">{article.title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {article.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                      article.status === 'Published' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs text-mono">
                      <Eye className="w-3.5 h-3.5" />
                      {article.views || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 font-mono text-xs">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDelete(article._id)}
                        className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete Article"
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

export default Articles;
