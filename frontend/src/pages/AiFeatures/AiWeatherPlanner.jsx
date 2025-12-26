import { Autocomplete } from '@react-google-maps/api';
import { useAuth } from '@clerk/clerk-react';
import { CloudRain, Compass,  MapPin, CloudSun, Sun, Wind, Thermometer, Umbrella, Calendar, Sparkles } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';

import { useGoogleMaps } from '../../context/GoogleMapsContext';
import { generateWeatherForecast, clearWeatherForecast } from '../../redux/slices/aiSlice';

function AiWeatherPlanner() {
  const autocompleteRef = useRef(null);

  const [formData, setFormData] = useState({
    destination: 'Manali, India',
    startDate: '2025-01-15',
    endDate: '2025-01-20'
  });

  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { weatherData, isGenerating, error } = useSelector((state) => state.ai);
  const { isLoaded } = useGoogleMaps();

  // Clear weather data on unmount
  useEffect(() => {
    return () => {
      dispatch(clearWeatherForecast());
    };
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateWeather = async (e) => {
    e.preventDefault();

    try {
      await dispatch(generateWeatherForecast({
        getToken,
        weatherData: formData
      })).unwrap();
      toast.success('Weather forecast generated successfully!');
    } catch (error) {
      toast.error(error || 'Failed to generate weather forecast');
    }
  };

  const onAutocompleteLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.formatted_address || place?.name) {
      const destination = place.formatted_address || place.name;
      setFormData(prev => ({ ...prev, destination }));
    }
  };

   // Prevent past dates
   const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 pt-28 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-2 rounded-full mb-4">
            <CloudSun className="text-amber-600" size={20} />
            <span className="text-amber-700 font-semibold text-sm">AI Weather Insights</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent mb-4">
            Smart Weather Planner
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Get detailed weather forecasts and activity recommendations tailored to your travel dates.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 h-fit">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Compass className="text-amber-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Trip Details</h2>
            </div>

            <form onSubmit={handleGenerateWeather} className="space-y-6">
              {/* Destination */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Destination
                </label>
                {isLoaded ? (
                  <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
                      <input
                        type="text"
                        name="destination"
                        value={formData.destination}
                        onChange={handleInputChange}
                        placeholder="Search destination"
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </Autocomplete>
                ) : (
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50" disabled placeholder="Loading..." />
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    min={today}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    min={formData.startDate || today}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                   <>
                   <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                   Analyzing Weather...
                 </>
                ) : (
                  <>
                    <CloudSun size={20} />
                    Check Weather
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Section */}
          <div className="bg-gradient-to-br from-amber-50 via-white to-yellow-50 rounded-3xl shadow-xl border-2 border-amber-100 p-8">
            {!weatherData ? (
               <div className="h-full flex flex-col items-center justify-center text-center p-8">
               <div className="bg-gradient-to-br from-amber-100 to-yellow-100 p-6 rounded-2xl mb-6 animate-pulse">
                 <CloudSun size={48} className="text-amber-600" />
               </div>
               <h3 className="text-2xl font-bold mb-3 text-gray-800">Weather Forecast</h3>
               <p className="text-gray-600 max-w-md">
                 Enter your destination and dates to get a comprehensive weather report and AI-curated advice.
               </p>
             </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* Current Summary */}
                <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full blur-2xl -mr-10 -mt-10 opacity-50"></div>

                   <div className="relative z-10">
                       <h3 className="text-xl font-bold text-gray-800 mb-2">{weatherData.location}</h3>
                       <div className="flex items-center gap-4 mb-4">
                           <span className="text-4xl font-bold text-gray-900">{weatherData.current.temp}</span>
                           <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                               {weatherData.current.condition}
                           </div>
                       </div>
                       <p className="text-gray-600 text-sm leading-relaxed">
                           {weatherData.summary}
                       </p>
                       <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                           <div className="flex items-center gap-2 text-gray-600 text-sm">
                               <Wind size={16} className="text-gray-400"/> Wind: {weatherData.current.wind}
                           </div>
                           <div className="flex items-center gap-2 text-gray-600 text-sm">
                               <CloudRain size={16} className="text-blue-400"/> Humidity: {weatherData.current.humidity}
                           </div>
                       </div>
                   </div>
                </div>

                {/* Forecast List */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800 ml-1">Daily Forecast</h4>
                    <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-200">
                        {weatherData.forecast.map((day, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-amber-100">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-lg shadow-sm">
                                        {day.icon === 'sun' ? <Sun className="text-orange-500 w-5 h-5"/> :
                                         day.icon === 'snow' ? <Sparkles className="text-blue-400 w-5 h-5"/> :
                                         <CloudSun className="text-gray-500 w-5 h-5"/>}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{new Date(day.date).toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})}</p>
                                        <p className="text-xs text-gray-500">{day.condition}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-gray-700">{day.temp}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recommendations */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <h4 className="font-semibold text-blue-800 text-sm mb-2 flex items-center gap-2">
                             What to Pack
                        </h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                            {weatherData.packing_advice.map((item, i) => <li key={i}>• {item}</li>)}
                        </ul>
                    </div>
                     <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                        <h4 className="font-semibold text-green-800 text-sm mb-2 flex items-center gap-2">
                             Best Activities
                        </h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                            {weatherData.activities.map((item, i) => <li key={i}>• {item}</li>)}
                        </ul>
                    </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiWeatherPlanner;
