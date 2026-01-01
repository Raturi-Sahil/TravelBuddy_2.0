import { useAuth } from '@clerk/clerk-react';
import { Autocomplete } from '@react-google-maps/api';
import {
  Globe,
  Image as ImageIcon,
  Loader2,
  Lock,
  MapPin,
  Plus,
  Sparkles,
  Tag,
  Upload as UploadIcon,
  Users,
  Video,
  X,
  Wand2,
  Navigation,
  Hash,
  Edit3,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  SunMedium,
  Contrast,
  Check,
  Undo2
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
  const [dragActive, setDragActive] = useState(false);

  // Image Editor States
  const [editingImageIndex, setEditingImageIndex] = useState(null);
  const [editingImage, setEditingImage] = useState(null);
  const [imageEditorOpen, setImageEditorOpen] = useState(false);
  const [imageEditSettings, setImageEditSettings] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    rotation: 0,
    flipH: false,
    flipV: false,
    filter: 'none'
  });
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const autocompleteRef = useRef(null);

  useEffect(() => {
    return () => {
      dispatch(resetPostState());
    };
  }, [dispatch]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }
    setImages([...images, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    if (videos.length + files.length > 3) {
      toast.error('Maximum 3 videos allowed');
      return;
    }
    setVideos([...videos, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setVideoPreviews([...videoPreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const removeVideo = (index) => {
    const newVideos = videos.filter((_, i) => i !== index);
    const newPreviews = videoPreviews.filter((_, i) => i !== index);
    setVideos(newVideos);
    setVideoPreviews(newPreviews);
  };

  // Image Editor Functions
  const openImageEditor = (index) => {
    setEditingImageIndex(index);
    setEditingImage(imagePreviews[index]);
    setImageEditSettings({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      rotation: 0,
      flipH: false,
      flipV: false,
      filter: 'none'
    });
    setImageEditorOpen(true);
  };

  const closeImageEditor = () => {
    setImageEditorOpen(false);
    setEditingImageIndex(null);
    setEditingImage(null);
  };

  const getFilterStyle = () => {
    const { brightness, contrast, saturation, filter } = imageEditSettings;
    let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    switch (filter) {
      case 'grayscale':
        filterString += ' grayscale(100%)';
        break;
      case 'sepia':
        filterString += ' sepia(80%)';
        break;
      case 'vintage':
        filterString += ' sepia(40%) contrast(90%) brightness(90%)';
        break;
      case 'cool':
        filterString += ' hue-rotate(180deg) saturate(80%)';
        break;
      case 'warm':
        filterString += ' sepia(30%) saturate(120%)';
        break;
      case 'dramatic':
        filterString += ' contrast(150%) saturate(120%)';
        break;
      default:
        break;
    }
    return filterString;
  };

  const getTransformStyle = () => {
    const { rotation, flipH, flipV } = imageEditSettings;
    let transform = `rotate(${rotation}deg)`;
    if (flipH) transform += ' scaleX(-1)';
    if (flipV) transform += ' scaleY(-1)';
    return transform;
  };

  const rotateImage = () => {
    setImageEditSettings(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }));
  };

  const flipHorizontal = () => {
    setImageEditSettings(prev => ({
      ...prev,
      flipH: !prev.flipH
    }));
  };

  const flipVertical = () => {
    setImageEditSettings(prev => ({
      ...prev,
      flipV: !prev.flipV
    }));
  };

  const resetImageEdit = () => {
    setImageEditSettings({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      rotation: 0,
      flipH: false,
      flipV: false,
      filter: 'none'
    });
  };

  const saveEditedImage = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const { rotation, flipH, flipV, brightness, contrast, saturation, filter } = imageEditSettings;

      // Calculate canvas size based on rotation
      const isRotated90or270 = rotation === 90 || rotation === 270;
      canvas.width = isRotated90or270 ? img.height : img.width;
      canvas.height = isRotated90or270 ? img.width : img.height;

      ctx.save();

      // Move to center
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply flips
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      // Apply filters
      let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      switch (filter) {
        case 'grayscale': filterString += ' grayscale(100%)'; break;
        case 'sepia': filterString += ' sepia(80%)'; break;
        case 'vintage': filterString += ' sepia(40%) contrast(90%) brightness(90%)'; break;
        case 'cool': filterString += ' hue-rotate(180deg) saturate(80%)'; break;
        case 'warm': filterString += ' sepia(30%) saturate(120%)'; break;
        case 'dramatic': filterString += ' contrast(150%) saturate(120%)'; break;
      }
      ctx.filter = filterString;

      // Draw image centered
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      ctx.restore();

      // Convert canvas to blob and update
      canvas.toBlob((blob) => {
        const editedFile = new File([blob], `edited_image_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const editedPreview = URL.createObjectURL(blob);

        // Update images and previews
        const newImages = [...images];
        const newPreviews = [...imagePreviews];
        newImages[editingImageIndex] = editedFile;
        newPreviews[editingImageIndex] = editedPreview;

        setImages(newImages);
        setImagePreviews(newPreviews);

        toast.success('Image edited successfully!');
        closeImageEditor();
      }, 'image/jpeg', 0.9);
    };

    img.src = editingImage;
  };

  const filterPresets = [
    { id: 'none', name: 'Original' },
    { id: 'grayscale', name: 'B&W' },
    { id: 'sepia', name: 'Sepia' },
    { id: 'vintage', name: 'Vintage' },
    { id: 'cool', name: 'Cool' },
    { id: 'warm', name: 'Warm' },
    { id: 'dramatic', name: 'Dramatic' }
  ];

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim()) && formData.tags.length < 10) {
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

  const handleGenerateCaption = async () => {
    const postData = {
      currentCaption: formData.caption,
      location: formData.locationName,
      tags: formData.tags.join(', '),
      title: formData.caption.substring(0, 50) || "Travel Experience",
    };

    if (!formData.caption.trim() && !formData.locationName && formData.tags.length === 0) {
      toast.error('Please add some text, location, or tags first!');
      return;
    }

    try {
      const result = await dispatch(generatePostCaption({ getToken, postData })).unwrap();
      if (result && result.data) {
        setFormData(prev => ({ ...prev, caption: result.data }));
        toast.success('Caption enhanced with AI!');
      }
    } catch (err) {
      toast.error(err || 'Failed to generate caption');
    }
  };

  const onAutocompleteLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address || place.name || '';
      setFormData({ ...formData, locationName: address, latitude: lat, longitude: lng });
      toast.success('Location selected!');
    } else {
      toast.error('Please select a location from the dropdown');
    }
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setFormData({ ...formData, latitude, longitude });
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`
            );
            const data = await response.json();
            const locationName = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setFormData(prev => ({ ...prev, locationName }));
            toast.success('Location captured!');
          } catch (err) {
            setFormData(prev => ({ ...prev, locationName: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
          }
          setLocationLoading(false);
        },
        () => {
          toast.error('Failed to get location');
          setLocationLoading(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported');
      setLocationLoading(false);
    }
  };

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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const videoFiles = files.filter(f => f.type.startsWith('video/'));

    if (imageFiles.length > 0) {
      if (images.length + imageFiles.length <= 10) {
        setImages([...images, ...imageFiles]);
        setImagePreviews([...imagePreviews, ...imageFiles.map(f => URL.createObjectURL(f))]);
      } else {
        toast.error('Maximum 10 images allowed');
      }
    }
    if (videoFiles.length > 0) {
      if (videos.length + videoFiles.length <= 3) {
        setVideos([...videos, ...videoFiles]);
        setVideoPreviews([...videoPreviews, ...videoFiles.map(f => URL.createObjectURL(f))]);
      } else {
        toast.error('Maximum 3 videos allowed');
      }
    }
  };

  const visibilityOptions = [
    { value: 'Public', icon: Globe, label: 'Public', desc: 'Anyone can see' },
    { value: 'Friends', icon: Users, label: 'Friends', desc: 'Only friends' },
    { value: 'Private', icon: Lock, label: 'Private', desc: 'Only you' },
  ];

  const totalMedia = images.length + videos.length;

  return (
    <div className="min-h-screen bg-white">

      <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="mb-8 mt-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <UploadIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
                <p className="text-gray-500 text-sm">Share your travel moments with the world</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Main Content Card */}
            <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-3xl border border-amber-200/50 shadow-xl shadow-amber-100/50 overflow-hidden">

              {/* Media Upload Section */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">Media</span>
                    {totalMedia > 0 && (
                      <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
                        {totalMedia} selected
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">Up to 10 photos • 3 videos</span>
                </div>

                {totalMedia === 0 ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
                      dragActive
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-amber-300 bg-gray-50/50 hover:bg-amber-50/30'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                        <ImageIcon className="w-9 h-9 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-gray-800 font-semibold mb-1">Drop your files here</p>
                        <p className="text-gray-400 text-sm">or click to browse from your device</p>
                      </div>
                      <div className="flex gap-3 mt-2">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-all shadow-sm hover:shadow">
                          <ImageIcon className="w-4 h-4 text-amber-600" />
                          Photos
                          <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                        </label>
                        <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-all shadow-sm hover:shadow">
                          <Video className="w-4 h-4 text-amber-600" />
                          Videos
                          <input type="file" accept="video/*" multiple onChange={handleVideoChange} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={`img-${index}`} className="relative aspect-square rounded-xl overflow-hidden group ring-1 ring-gray-200 shadow-sm">
                          <img src={preview} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => openImageEditor(index)}
                            className="absolute bottom-1.5 left-1.5 w-7 h-7 rounded-full bg-white/90 hover:bg-amber-500 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
                            title="Edit Image"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 hover:bg-red-500 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {videoPreviews.map((preview, index) => (
                        <div key={`vid-${index}`} className="relative aspect-square rounded-xl overflow-hidden group ring-1 ring-gray-200 shadow-sm">
                          <video src={preview} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                              <Video className="w-5 h-5 text-amber-600" />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVideo(index)}
                            className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 hover:bg-red-500 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {(images.length < 10 || videos.length < 3) && (
                        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-amber-400 flex items-center justify-center cursor-pointer transition-all bg-gray-50 hover:bg-amber-50">
                          <Plus className="w-6 h-6 text-gray-400 group-hover:text-amber-500" />
                          <input type="file" accept="image/*,video/*" multiple onChange={(e) => {
                            const files = Array.from(e.target.files);
                            files.forEach(f => {
                              if (f.type.startsWith('image/')) handleImageChange({ target: { files: [f] } });
                              if (f.type.startsWith('video/')) handleVideoChange({ target: { files: [f] } });
                            });
                          }} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Caption Section */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Wand2 className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">Caption</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateCaption}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-md shadow-purple-500/25 transition-all disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {isGenerating ? 'Generating...' : 'AI Enhance'}
                  </button>
                </div>
                <textarea
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="Write a compelling caption for your post..."
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none transition-all"
                />
                <div className="flex justify-end mt-2">
                  <span className={`text-xs font-medium ${formData.caption.length > 1800 ? 'text-amber-600' : 'text-gray-400'}`}>
                    {formData.caption.length}/2000
                  </span>
                </div>
              </div>

              {/* Location & Tags Row */}
              <div className="p-6 grid md:grid-cols-2 gap-6 border-b border-gray-100">
                {/* Location */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-rose-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">Location</span>
                  </div>
                  <div className="relative">
                    {isLoaded ? (
                      <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
                        <input
                          type="text"
                          placeholder="Add a location..."
                          defaultValue={formData.locationName}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        />
                      </Autocomplete>
                    ) : (
                      <input
                        type="text"
                        placeholder="Add a location..."
                        value={formData.locationName}
                        onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      />
                    )}
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50"
                      title="Use current location"
                    >
                      {locationLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Navigation className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Hash className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">Tags</span>
                    <span className="text-xs text-gray-400 font-medium">({formData.tags.length}/10)</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add a tag..."
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold text-gray-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold"
                        >
                          #{tag}
                          <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Visibility Section */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">Visibility</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {visibilityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, visibility: option.value })}
                      className={`p-4 rounded-2xl border-2 transition-all text-left ${
                        formData.visibility === option.value
                          ? 'border-amber-500 bg-amber-50 shadow-md shadow-amber-100'
                          : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white'
                      }`}
                    >
                      <option.icon className={`w-5 h-5 mb-2 ${formData.visibility === option.value ? 'text-amber-600' : 'text-gray-400'}`} />
                      <p className={`font-semibold text-sm ${formData.visibility === option.value ? 'text-gray-900' : 'text-gray-600'}`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-4 px-6 rounded-2xl font-semibold text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 shadow-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="flex-[2] py-4 px-6 rounded-2xl font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-5 h-5" />
                    Publish Post
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Image Editor Modal */}
      {imageEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Edit Image</h3>
                  <p className="text-xs text-gray-500">Adjust brightness, contrast, apply filters & more</p>
                </div>
              </div>
              <button
                onClick={closeImageEditor}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Image Preview */}
                <div className="bg-gray-100 rounded-2xl p-4 flex items-center justify-center min-h-[300px]">
                  <div className="relative overflow-hidden rounded-xl shadow-lg">
                    <img
                      ref={imageRef}
                      src={editingImage}
                      alt="Editing"
                      className="max-w-full max-h-[400px] object-contain transition-all duration-200"
                      style={{
                        filter: getFilterStyle(),
                        transform: getTransformStyle()
                      }}
                    />
                  </div>
                </div>

                {/* Edit Controls */}
                <div className="space-y-5">
                  {/* Transform Controls */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <RotateCw className="w-4 h-4 text-amber-600" />
                      Transform
                    </h4>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={rotateImage}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-amber-100 hover:text-amber-700 rounded-xl font-medium text-sm transition-colors"
                      >
                        <RotateCw className="w-4 h-4" />
                        Rotate
                      </button>
                      <button
                        type="button"
                        onClick={flipHorizontal}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                          imageEditSettings.flipH
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-100 hover:bg-amber-100 hover:text-amber-700'
                        }`}
                      >
                        <FlipHorizontal className="w-4 h-4" />
                        Flip H
                      </button>
                      <button
                        type="button"
                        onClick={flipVertical}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                          imageEditSettings.flipV
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-100 hover:bg-amber-100 hover:text-amber-700'
                        }`}
                      >
                        <FlipVertical className="w-4 h-4" />
                        Flip V
                      </button>
                    </div>
                  </div>

                  {/* Adjustment Sliders */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <SunMedium className="w-4 h-4 text-amber-600" />
                      Adjustments
                    </h4>
                    <div className="space-y-4">
                      {/* Brightness */}
                      <div>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-gray-600 font-medium">Brightness</span>
                          <span className="text-amber-600 font-semibold">{imageEditSettings.brightness}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={imageEditSettings.brightness}
                          onChange={(e) => setImageEditSettings(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>
                      {/* Contrast */}
                      <div>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-gray-600 font-medium">Contrast</span>
                          <span className="text-amber-600 font-semibold">{imageEditSettings.contrast}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={imageEditSettings.contrast}
                          onChange={(e) => setImageEditSettings(prev => ({ ...prev, contrast: parseInt(e.target.value) }))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>
                      {/* Saturation */}
                      <div>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-gray-600 font-medium">Saturation</span>
                          <span className="text-amber-600 font-semibold">{imageEditSettings.saturation}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={imageEditSettings.saturation}
                          onChange={(e) => setImageEditSettings(prev => ({ ...prev, saturation: parseInt(e.target.value) }))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Filter Presets */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      Filters
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {filterPresets.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setImageEditSettings(prev => ({ ...prev, filter: preset.id }))}
                          className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            imageEditSettings.filter === preset.id
                              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                              : 'bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-700'
                          }`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reset Button */}
                  <button
                    type="button"
                    onClick={resetImageEdit}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-sm text-gray-600 transition-colors"
                  >
                    <Undo2 className="w-4 h-4" />
                    Reset to Original
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={closeImageEditor}
                className="flex-1 py-3 px-6 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditedImage}
                className="flex-[2] py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Canvas for Image Processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default UploadPost;
