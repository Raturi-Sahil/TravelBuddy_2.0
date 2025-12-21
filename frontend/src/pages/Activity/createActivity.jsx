import { Autocomplete,GoogleMap, Marker } from "@react-google-maps/api";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { AlignLeft, Clock, DollarSign, Image as ImageIcon, Loader2,MapPin, Mic, MicOff, Plus, Search, Send, Sparkles, Users, Video, X } from "lucide-react";
import React, { useCallback, useEffect,useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createActivity } from "../../redux/slices/ActivitySlice";
import { useDispatch } from "react-redux";

import { useGoogleMaps } from "../../context/GoogleMapsContext";

const containerStyle = { width: "100%", height: "100%", borderRadius: "0.75rem" };
const categories = ["Adventure", "Culture", "Food", "Nightlife", "Sports", "Nature", "Other"];

// Reusable UI Components
const Section = ({ icon: Icon, title, children, className = "" }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6 ${className}`}>
    <h2 className="text-xl font-semibold flex items-center gap-2"><Icon className="w-5 h-5 text-indigo-500" />{title}</h2>
    {children}
  </div>
);

const Input = ({ label, icon: Icon, className, ...props }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      {Icon && (typeof Icon === 'string' ? <span className="absolute left-3 top-2.5 text-gray-500">{Icon}</span> : <Icon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />)}
      <input className={`w-full ${Icon ? (typeof Icon === 'string' ? 'pl-8' : 'pl-10') : 'px-4'} pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none`} {...props} />
    </div>
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white" {...props}>
      {options}
    </select>
  </div>
);

export default function CreateActivity() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { profile } = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mapRef = useRef(null);
  const dispatch = useDispatch();
  const autocompleteRef = useRef(null);
  const fileInputRef = useRef(null);
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.2090 });

  const [formData, setFormData] = useState({
    title: "", description: "", category: "", date: "", startTime: "", endTime: "",
    price: "", foreignerPrice: "", maxCapacity: "", gender: "Any", location: null, photos: [], videos: []
  });

  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    if (profile && !profile.planType) { toast.error("Please select a subscription plan."); navigate("/subscription"); }
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => setCenter({ lat: p.coords.latitude, lng: p.coords.longitude }));
  }, [profile, navigate]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const onAutocompleteLoad = (autocomplete) => { autocompleteRef.current = autocomplete; };
  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.geometry?.location) {
      const loc = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
      setFormData(prev => ({ ...prev, location: loc }));
      setCenter(loc);
    } else toast.error("Please select a location from the dropdown");
  };
  const onMapClick = useCallback((e) => setFormData(prev => ({ ...prev, location: { lat: e.latLng.lat(), lng: e.latLng.lng() }})), []);

  const handlePhotoSelect = (e) => {
    if (e.target.files?.length) {
      const newPhotos = Array.from(e.target.files).map(file => ({ file, preview: URL.createObjectURL(file) }));
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
    }
  };
  const handleRemovePhoto = (idx) => setFormData(prev => {
    URL.revokeObjectURL(prev.photos[idx].preview);
    return { ...prev, photos: prev.photos.filter((_, i) => i !== idx) };
  });

  const toggleRecording = () => {
    if (isRecording) { window.recognitionInstance?.stop(); setIsRecording(false); return; }
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return toast.error("Voice input not supported");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US';
    recognition.onstart = () => { setIsRecording(true); toast("Listening...", { icon: '🎙️' }); };
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      if (e.results[e.results.length-1].isFinal) setFormData(prev => ({ ...prev, description: (prev.description + " " + transcript).trim() }));
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    window.recognitionInstance = recognition;
    recognition.start();
  };

  const handleGenerateDescription = async () => {
    if (!formData.title || !formData.category) return toast.error("Title and Category required");
    setIsGenerating(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/ai/generate-description`, {
        ...formData, location: formData.location ? `${formData.location.lat}, ${formData.location.lng}` : undefined
      });
      if (data.data) { setFormData(prev => ({ ...prev, description: data.data })); toast.success("Description generated!"); }
    } catch (err) { toast.error(err.response?.data?.message || "Generation failed"); }
    finally { setIsGenerating(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location) return toast.error("Please select a location on the map");
    setIsLoading(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'location') {
             if (formData.location) {
                 payload.append('lat', formData.location.lat);
                 payload.append('lng', formData.location.lng);
             }
        }
        else if (key === 'photos') {
             formData.photos.forEach(p => {
                 if (p.file) payload.append("photos", p.file);
             });
        }
        else if (key === 'videos') {
             formData.videos.forEach(v => payload.append("videos", v));
        }
        else if (key === 'startTime' || key === 'endTime') {
            if (formData[key] && formData.date) {
                // Combine date and time
                const dateTimeStr = `${formData.date}T${formData[key]}`;
                payload.append(key, new Date(dateTimeStr).toISOString());
            }
        }
        else {
             payload.append(key, formData[key] || "");
        }
      });

      await dispatch(createActivity({
          getToken,
          activityData: payload
      })).unwrap(); // unwrap to catch errors here

      toast.success("Activity created successfully!");
      navigate("/activities"); // Redirect after success?
    } catch (err) { toast.error(err.response?.data?.message || err.message || "Failed to create"); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pt-20 mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Activity</h1>
          <p className="text-gray-500 mt-2">Share your adventure with the world.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Section icon={AlignLeft} title="Basic Details">
              <Input label="Activity Title" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g., Midnight Cycling" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Category" options={[<option key="def" value="">Select Category</option>, ...categories.map(c => <option key={c} value={c}>{c}</option>)]} name="category" value={formData.category} onChange={handleChange} required />
                <Input label="Max Capacity" type="number" icon={Users} name="maxCapacity" value={formData.maxCapacity} onChange={handleChange} required min="1" placeholder="Max participants" />
              </div>
            </Section>

            <Section icon={Clock} title="Date & Time">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Date" type="date" name="date" value={formData.date} onChange={handleChange} required />
                <Input label="Start Time" type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
                <Input label="End Time" type="time" name="endTime" value={formData.endTime} onChange={handleChange} />
              </div>
            </Section>

            <Section icon={DollarSign} title="Pricing & Rules">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Price (Local)" type="number" icon="₹" name="price" value={formData.price} onChange={handleChange} min="0" placeholder="0" />
                <Input label="Foreigner Price" type="number" icon="$" name="foreignerPrice" value={formData.foreignerPrice} onChange={handleChange} min="0" placeholder="Optional" />
                <Select label="Allowed Gender" options={<>{["Any", "Male Only", "Female Only"].map(o => <option key={o} value={o === "Male Only" ? "Male" : o === "Female Only" ? "Female" : "Any"}>{o}</option>)}</>} name="gender" value={formData.gender} onChange={handleChange} />
              </div>
            </Section>

            <Section icon={AlignLeft} title="Description">
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">Detailed Description</label>
                <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="text-indigo-600 hover:text-indigo-700 text-xs font-medium flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors disabled:opacity-50">
                  {isGenerating ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>} {isGenerating ? "Generating..." : "Generate with AI"}
                </button>
              </div>
              <div className="relative">
                <textarea name="description" value={formData.description} onChange={handleChange} rows="6" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Describe the activity..." />
                <button type="button" onClick={toggleRecording} className={`absolute bottom-3 right-3 p-2 rounded-full transition-all ${isRecording ? "bg-red-100 text-red-600 animate-pulse" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{isRecording ? <MicOff className="w-4 h-4"/> : <Mic className="w-4 h-4"/>}</button>
              </div>
              {isRecording && <p className="text-xs text-red-500 mt-1 animate-pulse">Recording... Speak now</p>}
            </Section>
          </div>

          <div className="space-y-6">
            <Section icon={MapPin} title="Location">
              {isLoaded ? (
                <div className="mb-4">
                  <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" placeholder="Search for a place..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                    </div>
                  </Autocomplete>
                </div>
              ) : null}
              <div className="h-64 bg-gray-100 rounded-xl overflow-hidden relative">
                {isLoaded ? (
                  <GoogleMap mapContainerStyle={containerStyle} center={formData.location || center} zoom={13} onClick={onMapClick} options={{ mapTypeControl: false, streetViewControl: false }}>
                    {formData.location && <Marker position={formData.location} />}
                  </GoogleMap>
                ) : <div className="h-full flex items-center justify-center text-gray-400">Loading Map...</div>}
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">{formData.location ? `Selected: ${formData.location.lat.toFixed(4)}, ${formData.location.lng.toFixed(4)}` : "Tap on map to select"}</p>
            </Section>

            <Section icon={ImageIcon} title="Photos">
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
                <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handlePhotoSelect} />
                <div className="w-12 h-12 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><ImageIcon className="w-6 h-6" /></div>
                <p className="text-sm font-medium text-gray-700">Click to upload photos</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {formData.photos.map((p, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden aspect-square border border-gray-200">
                    <img src={p.preview} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => handleRemovePhoto(i)} className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-red-500 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            </Section>

            <Section icon={Video} title="Videos">
              <div className="flex gap-2">
                <input type="text" placeholder="Paste video URL..." className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" onKeyDown={(e) => { if(e.key === 'Enter' && e.target.value.trim()) { setFormData(prev => ({...prev, videos:[...prev.videos, e.target.value]})); e.target.value = ''; e.preventDefault(); }}} />
                <button type="button" onClick={(e) => { const inp = e.currentTarget.previousElementSibling; if(inp && inp.value.trim()){ setFormData(prev => ({...prev, videos:[...prev.videos, inp.value]})); inp.value=''; } }} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Plus className="w-5 h-5"/></button>
              </div>
              <div className="space-y-2">
                {formData.videos.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg group">
                    <Video className="w-4 h-4 text-gray-500" /><span className="text-xs text-gray-500 truncate flex-1">{v}</span>
                    <button type="button" onClick={() => setFormData(prev => ({...prev, videos: prev.videos.filter((_, idx) => idx !== i)}))} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><X className="w-4 h-4"/></button>
                  </div>
                ))}
              </div>
            </Section>

            <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
              {isLoading ? "Creating..." : <><Send className="w-5 h-5" />Publish Activity</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
