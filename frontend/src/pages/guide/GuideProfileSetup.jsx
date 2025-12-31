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
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-24 pb-12 px-4 font-sans selection:bg-orange-500/30">

      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Profile' : 'Become a Guide'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Curate experiences. Share your world.
            </p>
          </div>
          {isEditing && (
             <button
              onClick={() => navigate('/guide-dashboard')}
              className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-600 text-sm font-medium transition-all"
            >
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN - Main Info (8 cols) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Card 1: Essential Info */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 relative overflow-hidden shadow-xl group hover:shadow-2xl transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" /> Location & Rate
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">City / Base</label>
                  <Autocomplete
                    onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                    onPlaceChanged={handlePlaceChanged}
                  >
                   <div className="relative">
                      <input
                        type="text"
                        placeholder="Search city..."
                        defaultValue={formData.city}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all placeholder-gray-400"
                      />
                      <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                        <MapPin size={18} />
                      </div>
                    </div>
                  </Autocomplete>
                </div>

                <div>
                   <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Daily Rate (₹)</label>
                   <input
                    type="number"
                    value={formData.pricePerDay}
                    onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                    placeholder="2000"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all placeholder-gray-400"
                  />
                </div>

                <div>
                   <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Years Exp.</label>
                   <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="3"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Expertise */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-5">Expertise</h3>

              <div className="space-y-6">
                <div>
                   <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Specialties</label>
                   <div className="flex flex-wrap gap-2">
                     {GUIDE_SPECIALTIES.map((specialty) => {
                       const active = formData.specialties.includes(specialty);
                       return (
                         <button
                           key={specialty}
                           type="button"
                           onClick={() => handleSpecialtyToggle(specialty)}
                           className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                             active
                             ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20'
                             : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                           }`}
                         >
                           {specialty}
                         </button>
                       );
                     })}
                   </div>
                </div>

                <div>
                   <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Languages</label>
                   <div className="grid gap-3">
                     {formData.languages.map((lang, index) => (
                       <div key={index} className="flex gap-2 group">
                         <select
                           value={lang.name}
                           onChange={(e) => handleLanguageChange(index, 'name', e.target.value)}
                           className="flex-1 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-500 outline-none hover:bg-gray-100 transition-colors"
                         >
                           <option value="">Language</option>
                           {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                         </select>
                         <select
                           value={lang.level}
                           onChange={(e) => handleLanguageChange(index, 'level', e.target.value)}
                           className="w-32 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-500 outline-none hover:bg-gray-100 transition-colors"
                         >
                           {LANGUAGE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                         </select>
                         {formData.languages.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLanguage(index)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X size={16}/>
                            </button>
                         )}
                       </div>
                     ))}
                   </div>
                   <button
                    type="button"
                    onClick={addLanguage}
                    className="mt-3 text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                   >
                     + Add Language
                   </button>
                </div>
              </div>
            </div>

             {/* Card 3: Bio */}
             <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">About You</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Introduce yourself. Why should travelers choose you?"
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all placeholder-gray-400 resize-none"
                />
             </div>

          </div>


          {/* RIGHT COLUMN - Media & Availability (4 cols) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Card 4: Images */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-semibold text-gray-800">Gallery</h3>
                 <span className="text-xs text-gray-400">{existingImages.length + coverImages.length}/5</span>
               </div>

               <div className="grid grid-cols-2 gap-2">
                 {[...existingImages, ...imagePreview].map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-100">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i, i < existingImages.length)}
                        className="absolute top-1 right-1 p-1 bg-white/90 hover:bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                      >
                       <X size={14} />
                      </button>
                    </div>
                 ))}

                 {(existingImages.length + coverImages.length < 5) && (
                   <label className="aspect-square rounded-xl border border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 group">
                     <ImagePlus className="w-6 h-6 text-gray-400 group-hover:text-orange-500 transition-colors" />
                     <span className="text-[10px] text-gray-400 group-hover:text-orange-600 font-medium">Add Photo</span>
                     <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                   </label>
                 )}
               </div>
            </div>

            {/* Card 5: Availability */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
               <h3 className="text-lg font-semibold text-gray-800 mb-4">Availability</h3>
               <div className="flex flex-wrap gap-2">
                 {DAYS_OF_WEEK.map((day, i) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleAvailabilityToggle(i)}
                      className={`flex-1 min-w-[80px] py-2.5 text-xs font-semibold rounded-lg border transition-all ${
                         formData.availability.some(a => a.dayOfWeek === i)
                         ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200'
                         : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {day.slice(0,3)}
                    </button>
                 ))}
               </div>
            </div>

            {/* Submit Action */}
             <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl shadow-orange-500/20 transition-all transform active:scale-95 ${
                loading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-tr from-orange-600 to-orange-500 text-white hover:brightness-110'
              }`}
            >
              {loading
                ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Processing...</span>
                : (isEditing ? 'Save Changes' : 'Publish Profile')
              }
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default GuideProfileSetup;
