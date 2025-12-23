import { useAuth } from '@clerk/clerk-react';
import {
  BookOpen,
  Check,
  Eye,
  FileText,
  Globe,
  Image as ImageIcon,
  Loader2,
  Lock,
  Sparkles,
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

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      dispatch(resetArticleState());
    };
  }, [dispatch]);

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    setImages([...images, ...files]);

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  // Handle submit
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

      // Add images
      images.forEach((image) => {
        articleFormData.append('images', image);
      });

      const result = await dispatch(createArticle({ getToken, articleData: articleFormData })).unwrap();

      toast.success(formData.status === 'Published' ? 'Article published successfully! 🎉' : 'Article saved as draft! 📝');

      // Reset form
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

      // Navigate to manage articles
      setTimeout(() => {
        navigate('/manage-article');
      }, 1500);
    } catch (err) {
      toast.error(err || 'Failed to create article');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full mb-4">
            <FileText className="text-amber-600" size={20} />
            <span className="text-amber-700 font-semibold text-sm">Write Article</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
            Share Your Travel Story
          </h1>
          <p className="text-gray-600 text-lg">
            Inspire others with your travel experiences and tips
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
              <FileText size={20} className="text-amber-600" />
              Article Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter a catchy title for your article..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 text-lg font-semibold"
              maxLength={200}
              required
            />
            <p className="text-xs text-gray-500 mt-2 text-right">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
              <BookOpen size={20} className="text-amber-600" />
              Article Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your article content here... Share your experiences, tips, and insights!"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none transition-all duration-200"
              rows={12}
              required
            />
            <p className="text-xs text-gray-500 mt-2 text-right">
              {formData.content.length} characters ({Math.ceil(formData.content.split(/\s+/).length / 200)} min read)
            </p>
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
              <Eye size={20} className="text-amber-600" />
              Excerpt (optional)
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Write a brief summary of your article (will be auto-generated if left empty)"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none transition-all duration-200"
              rows={3}
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-2 text-right">
              {formData.excerpt.length}/300 characters
            </p>
          </div>

          {/* Cover Image & Other Images */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
              <ImageIcon size={20} className="text-amber-600" />
              Images (First image will be cover photo)
            </label>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-amber-500 transition-colors cursor-pointer bg-gray-50">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <UploadIcon className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-700 font-medium mb-2">Click to upload images</p>
                <p className="text-gray-500 text-sm">Max 10 images, up to 10MB each</p>
              </label>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden border-2 border-gray-200">
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded-lg text-xs font-semibold z-10">
                        Cover Photo
                      </div>
                    )}
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
              <Tag size={20} className="text-amber-600" />
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
              <Tag size={20} className="text-amber-600" />
              Tags
            </label>
            <div className="flex gap-2 mb-4">
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
                placeholder="Add tags (e.g., backpacking, solo travel)"
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
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-4">
              <Globe size={20} className="text-amber-600" />
              Who can see this article?
            </label>
            <div className="grid grid-cols-3 gap-4">
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
                    size={28}
                    className={`mx-auto mb-2 ${
                      formData.visibility === option.value ? 'text-amber-600' : 'text-gray-400'
                    }`}
                  />
                  <p className="font-semibold">{option.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-4">
              <Check size={20} className="text-amber-600" />
              Publish or Save as Draft?
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'Draft', label: 'Save as Draft', desc: 'Work on it later', color: 'gray' },
                { value: 'Published', label: 'Publish Now', desc: 'Share with others', color: 'green' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: option.value })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.status === option.value
                      ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <p className="font-semibold text-lg">{option.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-600 font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                {formData.status === 'Published' ? 'Publishing...' : 'Saving...'}
              </>
            ) : (
              <>
                <FileText size={24} />
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
