import { useState, useRef } from 'react';
import { Calendar, MapPin, Users, Plus, Sparkles, Check, Info } from 'lucide-react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import { createActivity, UpdateActivity } from '../../redux/slices/userActivitySlice';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';

const libraries = ['places'];

function CreateActivity() {
  const dispatch = useDispatch();
  const locationState = useLocation();
  const activityId = locationState.state?.activityId || null;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    participantLimit: '',
    lat: 0,
    lng: 0
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (activityId) {
      dispatch(UpdateActivity({
        activityId,
        title: formData.title,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        participantLimit: formData.participantLimit,
        lat: formData.lat,
        lng: formData.lng
      }));
    } else {
      dispatch(createActivity({
        title: formData.title,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        participantLimit: formData.participantLimit,
        lat: formData.lat,
        lng: formData.lng
      }));
    }

    setFormData({
      title: '',
      description: '',
      date: '',
      location: '',
      participantLimit: 10,
      lat: 0,
      lng: 0
    });
  };

  const autocompleteRef = useRef(null);

  const onLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      setFormData(prev => ({
        ...prev,
        location: place.formatted_address || place.name || '',
        lat: lat,
        lng: lng
      }));
    }
  };

  return (
    <div className="min-h-screen bg-black">

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-12">

        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-50"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-5 rounded-3xl shadow-2xl shadow-blue-600/30">
                {activityId ? (
                  <Check className="w-12 h-12 text-white" />
                ) : (
                  <Sparkles className="w-12 h-12 text-white" />
                )}
              </div>
            </div>
          </div>

          {activityId ? (
            <>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Update Activity
              </h1>
              <p className="text-zinc-400 text-lg">Edit your activity details below</p>
            </>
          ) : (
            <>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Create New Activity
              </h1>
              <p className="text-zinc-400 text-lg">Share an amazing experience with fellow travelers</p>
            </>
          )}
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden">

          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-zinc-800 px-8 py-5 flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <h2 className="text-lg font-semibold text-white">Activity Details</h2>
          </div>

          <div className="p-8 space-y-6">

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-200 flex items-center">
                <div className="w-6 h-6 bg-blue-600/20 border border-blue-600/30 rounded-lg flex items-center justify-center mr-2">
                  <Plus className="w-3.5 h-3.5 text-blue-400" />
                </div>
                Activity Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Hiking in Central Park"
                className="w-full px-4 py-3.5 bg-zinc-950 border-2 border-zinc-800 rounded-xl text-zinc-100"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-200 flex items-center">
                <div className="w-6 h-6 bg-purple-600/20 border border-purple-600/30 rounded-lg flex items-center justify-center mr-2">
                  <Info className="w-3.5 h-3.5 text-purple-400" />
                </div>
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="5"
                className="w-full px-4 py-3.5 bg-zinc-950 border-2 border-zinc-800 rounded-xl text-zinc-100"
              />
            </div>

            {/* Date & Time */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-200 flex items-center">
                <div className="w-6 h-6 bg-green-600/20 border border-green-600/30 rounded-lg flex items-center justify-center mr-2">
                  <Calendar className="w-3.5 h-3.5 text-green-400" />
                </div>
                Date & Time *
              </label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-3.5 bg-zinc-950 border-2 border-zinc-800 rounded-xl text-zinc-100"
              />
            </div>

            {/* Location with Google Autocomplete */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-200 flex items-center">
                <div className="w-6 h-6 bg-orange-600/20 border border-orange-600/30 rounded-lg flex items-center justify-center mr-2">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                </div>
                Location *
              </label>

              <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_API} libraries={libraries}>
                <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                  <input
                    type="text"
                    placeholder="Search for a location"
                    className="w-full px-4 py-3.5 bg-zinc-950 border-2 border-zinc-800 rounded-xl text-zinc-100"
                  />
                </Autocomplete>
              </LoadScript>
            </div>

            {/* Participant Limit */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-200 flex items-center">
                <div className="w-6 h-6 bg-pink-600/20 border border-pink-600/30 rounded-lg flex items-center justify-center mr-2">
                  <Users className="w-3.5 h-3.5 text-pink-400" />
                </div>
                Participant Limit
              </label>
              <input
                type="number"
                name="participantLimit"
                value={formData.participantLimit}
                onChange={handleInputChange}
                min="1"
                max="50"
                className="w-full px-4 py-3.5 bg-zinc-950 border-2 border-zinc-800 rounded-xl text-zinc-100"
              />
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl"
              >
                {activityId ? "Update Activity" : "Create Activity"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateActivity;
