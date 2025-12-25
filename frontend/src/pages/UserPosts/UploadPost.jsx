import { useAuth } from '@clerk/clerk-react';
import { Autocomplete } from '@react-google-maps/api';
import {
  Camera,
  Check,
  Globe,
  Image as ImageIcon,
  Loader2,
  Lock,
  MapPin,
  Search,
  Sparkles,
  Tag,
  Upload as UploadIcon,
  Users,
  Video,
  X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useGoogleMaps } from '../../context/GoogleMapsContext';
import { generatePostCaption } from '../../redux/slices/aiSlice';
import { createPost, resetPostState } from '../../redux/slices/postSlice';

function UploadPost() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { isCreating, error } = useSelector((state) => state.post);
  const { isGenerating } = useSelector((state) => state.ai);
  const { isLoaded } = useGoogleMaps();

  const [formData, setFormData] = useState({
    caption: '',
    locationName: '',
    latitude: null,
    longitude: null,
    tags: [],
    visibility: 'Public',
  });

  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  const autocompleteRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      dispatch(resetPostState());
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

  // Handle video selection
  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);

    if (videos.length + files.length > 3) {
      toast.error('Maximum 3 videos allowed');
      return;
    }

    setVideos([...videos, ...files]);

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setVideoPreviews([...videoPreviews, ...newPreviews]);
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Remove video
  const removeVideo = (index) => {
    const newVideos = videos.filter((_, i) => i !== index);
    const newPreviews = videoPreviews.filter((_, i) => i !== index);
    setVideos(newVideos);
    setVideoPreviews(newPreviews);
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

  // Generate AI-enhanced caption
  const handleGenerateCaption = async () => {
    // Collect context data for AI
    const postData = {
      currentCaption: formData.caption,
      location: formData.locationName,
      tags: formData.tags.join(', '),
      title: formData.caption.substring(0, 50) || "Travel Experience",
    };

    // Validation
    if (!formData.caption.trim() && !formData.locationName && formData.tags.length === 0) {
      toast.error('Please add some text, location, or tags first to help AI generate better content!');
      return;
    }

    try {
      const result = await dispatch(generatePostCaption({
        getToken,
        postData
      })).unwrap();

      if (result && result.data) {
        setFormData(prev => ({ ...prev, caption: result.data }));
        toast.success('✨ Caption enhanced with AI!');
      }
    } catch (err) {
      toast.error(err || 'Failed to generate caption');
    }
  };

  // Autocomplete handlers
  const onAutocompleteLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();

    if (place?.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address || place.name || '';

      setFormData({
        ...formData,
        locationName: address,
        latitude: lat,
        longitude: lng,
      });

      toast.success('Location selected!');
    } else {
      toast.error('Please select a location from the dropdown');
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    setLocationLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          setFormData({
            ...formData,
            latitude,
            longitude,
          });

          // Reverse geocode to get location name
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`
            );
            const data = await response.json();
            const locationName = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

            setFormData(prev => ({
              ...prev,
              locationName,
            }));

            toast.success('Location captured!');
          } catch (err) {
            setFormData(prev => ({
              ...prev,
              locationName: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            }));
          }

          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Failed to get location');
          setLocationLoading(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
      setLocationLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.caption.trim()) {
      toast.error('Please add a caption');
      return;
    }

    if (images.length === 0 && videos.length === 0) {
      toast.error('Please add at least one image or video');
      return;
    }

    const postData = {
      caption: formData.caption,
      images: images,
      videos: videos,
      locationName: formData.locationName,
      lat: formData.latitude,
      lng: formData.longitude,
      tags: formData.tags,
      visibility: formData.visibility,
    };

    const result = await dispatch(createPost({ getToken, postData }));

    if (createPost.fulfilled.match(result)) {
      toast.success('Post created successfully! 🎉');
      navigate('/manage-posts');
    } else {
      toast.error(error || 'Failed to create post');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full mb-4">
            <Camera className="text-amber-600" size={20} />
            <span className="text-amber-700 font-semibold text-sm">Create Post</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
            Share Your Journey
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Share your travel moments with the community
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-8">
          {/* Caption */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                <Camera size={18} className="text-amber-600" />
                Caption *
              </label>
              <button
                type="button"
                onClick={handleGenerateCaption}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Enhance with AI
                  </>
                )}
              </button>
            </div>
            <textarea
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              placeholder="Share your experience... (e.g., 'Amazing sunset at the beach, felt so peaceful') - Click 'Enhance with AI' to make it even better!"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none transition-all duration-200"
              rows={4}
              maxLength={2000}
              required
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                💡 Tip: Add location and tags for better AI suggestions
              </p>
              <p className="text-xs text-gray-500">
                {formData.caption.length}/2000 characters
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
              <ImageIcon size={18} className="text-amber-600" />
              Images (Max 10)
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              {images.length < 10 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 transition-all duration-200 group">
                  <UploadIcon size={32} className="text-gray-400 group-hover:text-amber-500 transition-colors" />
                  <span className="text-sm text-gray-500 group-hover:text-amber-600 font-medium">
                    Add Image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Video Upload */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
              <Video size={18} className="text-amber-600" />
              Videos (Max 3)
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {videoPreviews.map((preview, index) => (
                <div key={index} className="relative group aspect-video rounded-xl overflow-hidden border-2 border-gray-200">
                  <video
                    src={preview}
                    className="w-full h-full object-cover"
                    controls
                  />
                  <button
                    type="button"
                    onClick={() => removeVideo(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              {videos.length < 3 && (
                <label className="aspect-video border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 transition-all duration-200 group">
                  <Video size={32} className="text-gray-400 group-hover:text-amber-500 transition-colors" />
                  <span className="text-sm text-gray-500 group-hover:text-amber-600 font-medium">
                    Add Video
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
              <MapPin size={18} className="text-amber-600" />
              Location
            </label>
            <div className="flex gap-3">
              {isLoaded ? (
                <Autocomplete
                  onLoad={onAutocompleteLoad}
                  onPlaceChanged={onPlaceChanged}
                  className="flex-1"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for a location..."
                      defaultValue={formData.locationName}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
                    />
                  </div>
                </Autocomplete>
              ) : (
                <input
                  type="text"
                  value={formData.locationName}
                  onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  placeholder="Add location..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
                />
              )}
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 flex items-center gap-2 font-medium disabled:opacity-50"
              >
                {locationLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <MapPin size={18} />
                )}
                {locationLoading ? 'Getting...' : 'Use Current'}
              </button>
            </div>
            {formData.latitude && formData.longitude && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Check size={12} className="text-green-500" />
                Coordinates: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
              </p>
            )}
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

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Create Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadPost;
