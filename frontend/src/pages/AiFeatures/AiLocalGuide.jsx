import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { Coffee, Compass, Landmark, Map, MapPin, Music, Sparkles, Store, Utensils } from 'lucide-react';
import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';

import { useGoogleMaps } from '../../context/GoogleMapsContext';
import { generateLocalGuide, clearLocalGuide } from '../../redux/slices/aiSlice';

function AiLocalGuide() {
  const autocompleteRef = useRef(null);

  const [formData, setFormData] = useState({
    location: 'Kyoto, Japan',
    interests: ['Food', 'History', 'Hidden Gems'],
    duration: 'Full Day'
  });

  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { guideData, isGenerating, error } = useSelector((state) => state.ai);
  const { isLoaded } = useGoogleMaps();

  // Clear data on unmount
  useEffect(() => {
    return () => {
      dispatch(clearLocalGuide());
    };
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleGenerateGuide = async (e) => {
    e.preventDefault();

    try {
      await dispatch(generateLocalGuide({
        getToken,
        guideData: formData
      })).unwrap();
      toast.success('Local guide generated successfully!');
    } catch (error) {
       toast.error(error || 'Failed to generate local guide');
    }
  };

  const onAutocompleteLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.formatted_address || place?.name) {
      setFormData(prev => ({ ...prev, location: place.formatted_address || place.name }));
    }
  };

  const interestOptions = ["History", "Food", "Art", "Nature", "Shopping", "Nightlife", "Hidden Gems", "Photography"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 pt-28 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-100 to-emerald-100 px-4 py-2 rounded-full mb-4">
            <Compass className="text-teal-600" size={20} />
            <span className="text-teal-700 font-semibold text-sm">AI Local Guide</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent mb-4">
            Discover Like a Local
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Uncover hidden gems, must-visit landmarks, and authentic experiences tailored to your interests.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 h-fit">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-teal-100 rounded-xl">
                <Map className="text-teal-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Explore Location</h2>
            </div>

            <form onSubmit={handleGenerateGuide} className="space-y-6">
              {/* Location Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Where do you want to go?
                </label>
                {isLoaded ? (
                  <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Search city or neighborhood"
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </Autocomplete>
                ) : (
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50" disabled placeholder="Loading maps..." />
                  </div>
                )}
              </div>

               {/* Duration */}
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                  >
                    <option>Half Day (Morning)</option>
                    <option>Half Day (Afternoon)</option>
                    <option>Full Day</option>
                    <option>Evening / Night</option>
                  </select>
               </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  What defines your style?
                </label>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        formData.interests.includes(interest)
                          ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                   <>
                   <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                   Curating Experience...
                 </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Guide
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Section */}
          <div className="bg-gradient-to-br from-teal-50 via-white to-emerald-50 rounded-3xl shadow-xl border-2 border-teal-100 p-8">
            {!guideData ? (
               <div className="h-full flex flex-col items-center justify-center text-center p-8">
               <div className="bg-gradient-to-br from-teal-100 to-emerald-100 p-6 rounded-2xl mb-6 animate-pulse">
                 <Compass size={48} className="text-teal-600" />
               </div>
               <h3 className="text-2xl font-bold mb-3 text-gray-800">Your Local Guide Awaits</h3>
               <p className="text-gray-600 max-w-md">
                 Let us find the perfect spots for you. Discover where to eat, what to see, and how to experience {formData.location || "your destination"} like a true local.
               </p>
             </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
                <div className="bg-white rounded-2xl p-6 border border-teal-100 shadow-sm">
                   <h3 className="text-xl font-bold text-gray-900 mb-2">{guideData.title}</h3>
                   <p className="text-gray-600 text-sm leading-relaxed">{guideData.summary}</p>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[400px] scrollbar-thin scrollbar-thumb-teal-200">
                    <h4 className="font-semibold text-gray-800 ml-1 sticky top-0 bg-opacity-90 backdrop-blur-md pb-2 z-10">Curated Spots</h4>
                    {guideData.spots.map((spot, idx) => (
                        <div key={idx} className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-teal-50 hover:border-teal-200 transition-colors group">
                            <div className="flex items-start gap-3">
                                <div className="p-3 bg-teal-50 group-hover:bg-teal-100 rounded-lg transition-colors">
                                    {spot.icon === 'food' ? <Utensils size={20} className="text-orange-500"/> :
                                     spot.icon === 'culture' ? <Landmark size={20} className="text-purple-500"/> :
                                     spot.icon === 'landmark' ? <Store size={20} className="text-teal-600"/> :
                                     <MapPin size={20} className="text-teal-600"/>}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h5 className="font-bold text-gray-900">{spot.name}</h5>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wider font-semibold">{spot.type}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{spot.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                    <h4 className="font-semibold text-yellow-800 text-sm mb-2 flex items-center gap-2">
                        💡 Local Tips
                    </h4>
                    <ul className="text-xs text-gray-700 space-y-1 ml-4 list-disc">
                        {guideData.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiLocalGuide;
