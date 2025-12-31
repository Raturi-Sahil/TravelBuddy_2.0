import { useAuth } from '@clerk/clerk-react';
import {
  BookOpen,
  Check,
  ChevronDown,
  Eye,
  FileText,
  Globe,
  Image as ImageIcon,
  Loader2,
  Lock,
  Plus,
  Send,
  Tag,
  Upload as UploadIcon,
  Users,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { createArticle, resetArticleState } from '../../redux/slices/articleSlice';

const categories = [
  "Destination Guide",
  "Travel Tips",
  "Budget Travel",
  "Digital Nomad",
  "Sustainable Travel",
  "Food & Culture",
  "Photography",
  "Adventure"
];

function UploadArticle() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { isCreating, error } = useSelector((state) => state.article);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'Travel Tips',
    tags: [],
    visibility: 'Public',
    status: 'Draft',
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    return () => {
      dispatch(resetArticleState());
    };
  }, [dispatch]);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (images.length + imageFiles.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }
    setImages([...images, ...imageFiles]);
    const newPreviews = imageFiles.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 8) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Content is required');
      return;
    }

    try {
      const articleFormData = new FormData();
      articleFormData.append('title', formData.title);
      articleFormData.append('content', formData.content);
      if (formData.excerpt) {
        articleFormData.append('excerpt', formData.excerpt);
      }
      articleFormData.append('category', formData.category);
      articleFormData.append('visibility', formData.visibility);
      articleFormData.append('status', formData.status);
      articleFormData.append('tags', JSON.stringify(formData.tags));

      images.forEach((image) => {
        articleFormData.append('images', image);
      });

      await dispatch(createArticle({ getToken, articleData: articleFormData })).unwrap();

      toast.success(formData.status === 'Published' ? 'Article published! 🎉' : 'Saved as draft! 📝');

      setFormData({
        title: '',
        content: '',
        excerpt: '',
        category: 'Travel Tips',
        tags: [],
        visibility: 'Public',
        status: 'Draft',
      });
      setImages([]);
      setImagePreviews([]);

      setTimeout(() => navigate('/manage-article'), 1500);
    } catch (err) {
      toast.error(err || 'Failed to create article');
    }
  };

  const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Compact Header */}
        <div className="mb-6 mt-4">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <FileText size={20} />
            <span className="text-sm font-semibold uppercase tracking-wide">Write Article</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Share Your Travel Story</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title & Category Row */}
          <div className="bg-violet-100 rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter a catchy title..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-gray-900 font-medium"
                  maxLength={200}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none appearance-none bg-violet-100 text-gray-900"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-violet-100 rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <BookOpen size={14} />
                Content *
              </label>
              <span className="text-xs text-gray-400">
                {wordCount} words • {readTime} min read
              </span>
            </div>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your article here... Share experiences, tips, and insights!"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none resize-none text-gray-700 leading-relaxed"
              rows={10}
              required
            />
          </div>

          {/* Excerpt */}
          <div className="bg-violet-100 rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Eye size={14} />
                Excerpt (Optional)
              </label>
              <span className="text-xs text-gray-400">{formData.excerpt.length}/300</span>
            </div>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Brief summary (auto-generated if empty)"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none resize-none text-gray-700"
              rows={2}
              maxLength={300}
            />
          </div>

          {/* Images - Compact */}
          <div className="bg-violet-100 rounded-xl border border-gray-200 p-4 shadow-sm">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block flex items-center gap-1.5">
              <ImageIcon size={14} />
              Images (First = Cover)
            </label>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-amber-400 bg-gray-50'
              }`}
            >
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                <UploadIcon className="text-gray-400 mb-2" size={28} />
                <p className="text-sm text-gray-600">Drop images or <span className="text-amber-600 font-medium">browse</span></p>
                <p className="text-xs text-gray-400 mt-1">Max 10 images, 10MB each</p>
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                    {index === 0 && (
                      <div className="absolute top-0.5 left-0.5 bg-amber-500 text-white px-1 py-0.5 rounded text-[10px] font-bold z-10">
                        Cover
                      </div>
                    )}
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={18} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags - Compact */}
          <div className="bg-violet-100 rounded-xl border border-gray-200 p-4 shadow-sm">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block flex items-center gap-1.5">
              <Tag size={14} />
              Tags ({formData.tags.length}/8)
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
                placeholder="Add tags..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm"
              />
              <button
                type="button"
                onClick={addTag}
                disabled={formData.tags.length >= 8}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <Plus size={18} />
              </button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-medium"
                  >
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:bg-amber-200 rounded-full p-0.5">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Visibility & Status - Combined Row */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Visibility */}
            <div className="bg-violet-100 rounded-xl border border-gray-200 p-4 shadow-sm">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block flex items-center gap-1.5">
                <Globe size={14} />
                Visibility
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'Public', icon: Globe },
                  { value: 'Friends', icon: Users },
                  { value: 'Private', icon: Lock },
                ].map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, visibility: value })}
                    className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                      formData.visibility === value
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-xs font-medium">{value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block flex items-center gap-1.5">
                <Check size={14} />
                Status
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'Draft', label: 'Draft', color: 'gray' },
                  { value: 'Published', label: 'Publish', color: 'green' },
                ].map(({ value, label, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: value })}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                      formData.status === value
                        ? value === 'Published'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-500 bg-gray-50 text-gray-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <p className="text-red-600 text-sm">⚠️ {error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3.5 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {formData.status === 'Published' ? 'Publishing...' : 'Saving...'}
              </>
            ) : (
              <>
                <Send size={20} />
                {formData.status === 'Published' ? 'Publish Article' : 'Save as Draft'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UploadArticle;
