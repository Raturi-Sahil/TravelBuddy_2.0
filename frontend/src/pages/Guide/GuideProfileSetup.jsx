import { useAuth } from '@clerk/clerk-react';
import { Autocomplete } from '@react-google-maps/api';
import { ImagePlus, MapPin, X } from 'lucide-react';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { GUIDE_SPECIALTIES, LANGUAGE_LEVELS, LANGUAGES } from '../../data/enums';
import { createGuideProfile, updateGuideProfile } from '../../redux/slices/guideSlice';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const GuideProfileSetup = () => {
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myGuideProfile, loading } = useSelector((state) => state.guide);

  const isEditing = !!myGuideProfile;

  const [formData, setFormData] = useState({
    city: myGuideProfile?.city || '',
    lat: myGuideProfile?.cityCoordinates?.coordinates?.[1] || '',
    lng: myGuideProfile?.cityCoordinates?.coordinates?.[0] || '',
    specialties: myGuideProfile?.specialties || [],
    languages: myGuideProfile?.languages || [{ name: '', level: 'Intermediate' }],
    pricePerDay: myGuideProfile?.pricePerDay || '',
    experience: myGuideProfile?.experience || '',
    bio: myGuideProfile?.bio || '',
    availability: myGuideProfile?.availability || [],
  });

  const [coverImages, setCoverImages] = useState([]);
  const [existingImages, setExistingImages] = useState(myGuideProfile?.coverImages || []);
  const [imagePreview, setImagePreview] = useState([]);

  const autocompleteRef = useRef(null);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.geometry) {
      setFormData({
        ...formData,
        city: place.formatted_address || place.name,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    }
  };

  const handleSpecialtyToggle = (specialty) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  const handleLanguageChange = (index, field, value) => {
    const newLanguages = [...formData.languages];
    newLanguages[index] = { ...newLanguages[index], [field]: value };
    setFormData({ ...formData, languages: newLanguages });
  };

  const addLanguage = () => {
    setFormData({
      ...formData,
      languages: [...formData.languages, { name: '', level: 'Intermediate' }],
    });
  };

  const removeLanguage = (index) => {
    if (formData.languages.length > 1) {
      setFormData({
        ...formData,
        languages: formData.languages.filter((_, i) => i !== index),
      });
    }
  };

  const handleAvailabilityToggle = (dayIndex) => {
    setFormData((prev) => {
      const exists = prev.availability.find((a) => a.dayOfWeek === dayIndex);
      if (exists) {
        return {
          ...prev,
          availability: prev.availability.filter((a) => a.dayOfWeek !== dayIndex),
        };
      }
      return {
        ...prev,
        availability: [
          ...prev.availability,
          { dayOfWeek: dayIndex },
        ],
      };
    });
  };



  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + coverImages.length + files.length;

    if (totalImages > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setCoverImages([...coverImages, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index, isExisting) => {
    if (isExisting) {
      setExistingImages(existingImages.filter((_, i) => i !== index));
    } else {
      setCoverImages(coverImages.filter((_, i) => i !== index));
      setImagePreview(imagePreview.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.city || !formData.lat || !formData.lng) {
      toast.error('Please select a city using the search');
      return;
    }

    if (formData.specialties.length === 0) {
      toast.error('Please select at least one specialty');
      return;
    }

    if (!formData.languages[0]?.name) {
      toast.error('Please add at least one language');
      return;
    }

    if (!formData.pricePerDay || formData.pricePerDay <= 0) {
      toast.error('Please enter a valid price per day');
      return;
    }

    if (!formData.experience || formData.experience <= 0) {
      toast.error('Please enter your years of experience');
      return;
    }

    if (!formData.bio || formData.bio.trim().length < 10) {
      toast.error('Please write a bio (at least 10 characters)');
      return;
    }

    if (existingImages.length + coverImages.length === 0) {
      toast.error('Please upload at least one cover image');
      return;
    }

    if (formData.availability.length === 0) {
      toast.error('Please select at least one available day');
      return;
    }

    try {
      const submitData = {
        ...formData,
        coverImages: coverImages,
        existingImages: existingImages,
        newImages: coverImages,
      };

      if (isEditing) {
        await dispatch(updateGuideProfile({ getToken, profileData: submitData })).unwrap();
        toast.success('Guide profile updated successfully!');
      } else {
        await dispatch(createGuideProfile({ getToken, profileData: submitData })).unwrap();
        toast.success('Guide profile created successfully!');
      }

      navigate('/guide-dashboard');
    } catch (error) {
      toast.error(error || 'Failed to save guide profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  {isEditing ? 'Edit Guide Profile' : 'Become a Local Guide'}
                </h1>
                <p className="text-orange-100">
                  Share your local expertise with travelers from around the world
                </p>
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => navigate('/guide-dashboard')}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors"
                >
                  <X size={18} />
                  Cancel
                </button>
              )}
            </div>
          </div>

          <form className="p-6 md:p-8 space-y-6" onSubmit={handleSubmit}>
            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                City / Location
              </label>
              <Autocomplete
                onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                onPlaceChanged={handlePlaceChanged}
              >
                <div className="relative">
                  <MapPin size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for your city..."
                    defaultValue={formData.city}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </Autocomplete>
            </div>

            {/* Specialties */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Specialties (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {GUIDE_SPECIALTIES.map((specialty) => (
                  <label
                    key={specialty}
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.specialties.includes(specialty)
                        ? 'bg-orange-50 border-orange-300 text-orange-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.specialties.includes(specialty)}
                      onChange={() => handleSpecialtyToggle(specialty)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{specialty}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Languages You Speak
              </label>
              <div className="space-y-2">
                {formData.languages.map((lang, index) => (
                  <div key={index} className="flex gap-2">
                    <select
                      value={lang.name}
                      onChange={(e) => handleLanguageChange(index, 'name', e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    >
                      <option value="">Select Language</option>
                      {LANGUAGES.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                    <select
                      value={lang.level}
                      onChange={(e) => handleLanguageChange(index, 'level', e.target.value)}
                      className="w-32 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    >
                      {LANGUAGE_LEVELS.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    {formData.languages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLanguage(index)}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addLanguage}
                className="mt-2 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                + Add Language
              </button>
            </div>

            {/* Price and Experience */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Price per Day (₹)
                </label>
                <input
                  type="number"
                  value={formData.pricePerDay}
                  onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                  placeholder="e.g., 2000"
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="e.g., 3"
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                About You
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell travelers about yourself, your local knowledge, and what makes your tours special..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none"
              />
            </div>

            {/* Cover Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Cover Images (Up to 5)
              </label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {existingImages.map((img, index) => (
                  <div key={`existing-${index}`} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={img} alt={`Cover ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index, true)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {imagePreview.map((preview, index) => (
                  <div key={`new-${index}`} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={preview} alt={`New ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index, false)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {existingImages.length + coverImages.length < 5 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <ImagePlus size={24} className="text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Add</span>
                  </label>
                )}
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Available Days
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map((day, index) => {
                  const isSelected = formData.availability.some((a) => a.dayOfWeek === index);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleAvailabilityToggle(index)}
                      className={`px-4 py-3 rounded-xl font-medium transition-all ${
                        isSelected
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                loading
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:shadow-orange-500/30'
              }`}
            >
              {loading ? 'Saving...' : isEditing ? 'Update Profile' : 'Create Guide Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GuideProfileSetup;
