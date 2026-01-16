import { useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Bus, Car, Camera, Check, Clock, IndianRupee, MapPin, Phone, Plus, Route, Shield, Truck, Upload, Users, X, Zap
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { createTransportListing, clearCreateSuccess, clearTransportError } from "../../redux/slices/transportSlice";

const vehicleTypes = [
  { id: 'taxi', name: 'Taxi', icon: Car, description: '4-seater cars', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80' },
  { id: 'auto', name: 'Auto Rickshaw', icon: Car, description: '3-wheeler autos', image: 'https://5.imimg.com/data5/SELLER/Default/2022/7/KO/SR/YU/110303668/bajaj-re-cng-auto-rickshaw-500x500.png' },
  { id: 'minivan', name: 'Mini Van', icon: Truck, description: '8-12 seaters', image: 'https://strapi-file-uploads.parkplus.io/Maruti_Eeco_Tour_V_5bddb124a5.webp' },
  { id: 'tempo', name: 'Tempo Traveller', icon: Truck, description: '12-20 seaters', image: 'https://www.maharanacab.com/wp-content/uploads/2022/07/9-Seater-Tempo-Traveller.jpg' },
  { id: 'bus', name: 'Bus', icon: Bus, description: '20+ seaters', image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&q=80' },
  { id: 'bike', name: 'Bike / Scooty', icon: Car, description: '2-wheeler rentals', image: 'https://imgd.aeplcdn.com/476x268/bw/models/royal-enfield-classic-350-single-channel-abs--bs-vi20200303121804.jpg' },
];

const commonFeatures = [
  'AC', 'Non-AC', 'Music System', 'USB Charging', 'WiFi', 'First Aid Kit',
  'Luggage Space', 'Reclining Seats', 'GPS Navigation', 'Child Seat Available',
  'Helmet Provided', 'Fuel Included', 'Driver Included', 'Flexible Routes'
];

const priceTypes = [
  { id: 'per_trip', label: 'Per Trip' },
  { id: 'per_day', label: 'Per Day' },
  { id: 'per_km', label: 'Per Kilometer' },
  { id: 'per_seat', label: 'Per Seat' },
];

// Floating Particles
const FloatingParticles = () => {
  const [particles] = useState(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
    }))
  );

  return (
    <>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-br from-teal-300 to-cyan-400 opacity-30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{ y: [0, -20, -10, -30, 0] }}
          transition={{ duration: particle.duration, repeat: Infinity, delay: particle.delay, ease: "easeInOut" }}
        />
      ))}
    </>
  );
};

export default function ListVehicle() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getToken } = useAuth();

  const { createLoading, createSuccess, error } = useSelector((state) => state.transport);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    vehicleType: '',
    vehicleName: '',
    vehicleNumber: '',
    seatingCapacity: '',
    route: '',
    serviceArea: '',
    minPrice: '',
    maxPrice: '',
    priceType: 'per_trip',
    phone: '',
    whatsapp: '',
    features: [],
    languages: '',
    description: '',
    vehicleImages: [], // File objects
    imagePreviewUrls: [], // Preview URLs
  });

  // Handle success
  useEffect(() => {
    if (createSuccess) {
      toast.success('Vehicle listed successfully!');
      setCurrentStep(4); // Success step
      dispatch(clearCreateSuccess());
    }
  }, [createSuccess, dispatch]);

  // Handle error
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearTransportError());
    }
  }, [error, dispatch]);

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...formData.vehicleImages, ...files].slice(0, 5);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));

    setFormData(prev => ({
      ...prev,
      vehicleImages: newFiles,
      imagePreviewUrls: newPreviews
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      vehicleImages: prev.vehicleImages.filter((_, i) => i !== index),
      imagePreviewUrls: prev.imagePreviewUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    const listingData = {
      vehicleType: formData.vehicleType,
      vehicleName: formData.vehicleName,
      vehicleNumber: formData.vehicleNumber,
      seatingCapacity: formData.seatingCapacity,
      route: formData.route,
      serviceArea: formData.serviceArea,
      minPrice: formData.minPrice,
      maxPrice: formData.maxPrice || undefined,
      priceType: formData.priceType,
      phone: formData.phone,
      whatsapp: formData.whatsapp || undefined,
      features: formData.features,
      languages: formData.languages ? formData.languages.split(',').map(l => l.trim()) : [],
      description: formData.description || undefined,
      vehicleImages: formData.vehicleImages, // File objects
    };

    dispatch(createTransportListing({ getToken, listingData }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.vehicleType !== '';
      case 2: return formData.vehicleName && formData.seatingCapacity && formData.route && formData.serviceArea;
      case 3: return formData.minPrice && formData.phone;
      default: return true;
    }
  };

  const steps = [
    { num: 1, title: 'Vehicle Type' },
    { num: 2, title: 'Details' },
    { num: 3, title: 'Pricing & Contact' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 relative overflow-hidden pt-24">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-cyan-400 to-teal-400 rounded-full blur-3xl"
        />
        <FloatingParticles />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">


            <h1 className="text-lg font-bold text-slate-900">List Your Vehicle</h1>

            <div className="w-20" />
          </div>
        </div>
      </motion.div>

      {/* Progress Steps */}
      {currentStep < 4 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-8"
        >
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{
                      scale: currentStep === step.num ? 1.1 : 1,
                      backgroundColor: currentStep >= step.num ? '#14b8a6' : '#e2e8f0'
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      currentStep >= step.num ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {currentStep > step.num ? <Check className="w-5 h-5" /> : step.num}
                  </motion.div>
                  <span className={`text-xs mt-2 font-medium ${currentStep >= step.num ? 'text-teal-600' : 'text-slate-400'}`}>
                    {step.title}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-12 sm:w-24 h-1 mx-2 rounded-full transition-colors ${
                    currentStep > step.num ? 'bg-teal-500' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Form Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Step 1: Vehicle Type */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">What type of vehicle do you have?</h2>
              <p className="text-slate-500">Select the category that best describes your vehicle</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {vehicleTypes.map((type) => {
                const IconComponent = type.icon;
                const isSelected = formData.vehicleType === type.id;

                return (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateForm('vehicleType', type.id)}
                    className={`relative rounded-2xl border-2 transition-all overflow-hidden h-48 ${
                      isSelected
                        ? 'border-teal-500 shadow-lg shadow-teal-200'
                        : 'border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    {/* Background Image */}
                    <img
                      src={type.image}
                      alt={type.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 transition-all duration-300 ${
                      isSelected
                        ? 'bg-gradient-to-t from-teal-900/90 via-teal-800/60 to-teal-700/30'
                        : 'bg-gradient-to-t from-slate-900/80 via-slate-800/40 to-transparent'
                    }`} />

                    {/* Selected Checkmark */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3 w-7 h-7 bg-teal-500 rounded-full flex items-center justify-center shadow-lg z-10"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg mb-2 ${
                        isSelected ? 'bg-teal-500 text-white' : 'bg-white/90 text-slate-700'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                        <span className="text-xs font-bold">{type.description}</span>
                      </div>
                      <h3 className="font-bold text-white text-lg drop-shadow-md">{type.name}</h3>
                    </div>

                    {/* Hover Effect Border */}
                    {isSelected && (
                      <div className="absolute inset-0 border-4 border-teal-400/50 rounded-2xl pointer-events-none" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 2: Vehicle Details */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Tell us about your vehicle</h2>
              <p className="text-slate-500">These details help travelers find you</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
              {/* Vehicle Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Vehicle Name / Model *</label>
                <input
                  type="text"
                  placeholder="e.g., Maruti Swift Dzire, Force Traveller"
                  value={formData.vehicleName}
                  onChange={(e) => updateForm('vehicleName', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none transition-all"
                />
              </div>

              {/* Vehicle Number */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Vehicle Registration Number</label>
                <input
                  type="text"
                  placeholder="e.g., HP-01-AB-1234"
                  value={formData.vehicleNumber}
                  onChange={(e) => updateForm('vehicleNumber', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none transition-all"
                />
              </div>

              {/* Seating Capacity */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Seating Capacity *</label>
                <div className="grid grid-cols-5 gap-2">
                  {[2, 4, 6, 8, 12, 15, 20, 30, 45].map(seats => (
                    <motion.button
                      key={seats}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateForm('seatingCapacity', seats)}
                      className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                        formData.seatingCapacity === seats
                          ? 'bg-teal-500 text-white border-teal-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      {seats}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Route */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Route className="w-4 h-4 inline mr-1" /> Primary Route / Service *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Manali to Rohtang Pass, Delhi to Shimla"
                  value={formData.route}
                  onChange={(e) => updateForm('route', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none transition-all"
                />
              </div>

              {/* Service Area */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" /> Service Areas *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Manali, Kullu, Rohtang, Solang Valley"
                  value={formData.serviceArea}
                  onChange={(e) => updateForm('serviceArea', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none transition-all"
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Features & Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {commonFeatures.map(feature => (
                    <motion.button
                      key={feature}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleFeature(feature)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        formData.features.includes(feature)
                          ? 'bg-teal-500 text-white border-teal-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      {formData.features.includes(feature) && <Check className="w-3 h-3 inline mr-1" />}
                      {feature}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Vehicle Images */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  <Camera className="w-4 h-4 inline mr-1" /> Vehicle Photos (Max 5)
                </label>
                <div className="flex flex-wrap gap-3">
                  {formData.imagePreviewUrls.map((img, i) => (
                    <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {formData.imagePreviewUrls.length < 5 && (
                    <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-all">
                      <Upload className="w-6 h-6 text-slate-400" />
                      <span className="text-xs text-slate-400 mt-1">Add</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Pricing & Contact */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Set your pricing & contact</h2>
              <p className="text-slate-500">Let travelers know how to reach you</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <IndianRupee className="w-4 h-4 inline mr-1" /> Price Range *
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={formData.minPrice}
                      onChange={(e) => updateForm('minPrice', e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <span className="text-slate-400">to</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={formData.maxPrice}
                      onChange={(e) => updateForm('maxPrice', e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Price Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Price Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {priceTypes.map(type => (
                    <motion.button
                      key={type.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateForm('priceType', type.id)}
                      className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                        formData.priceType === type.id
                          ? 'bg-teal-50 text-teal-700 border-teal-300 ring-1 ring-teal-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      {type.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" /> Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">WhatsApp Number (if different)</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.whatsapp}
                  onChange={(e) => updateForm('whatsapp', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Languages Spoken</label>
                <input
                  type="text"
                  placeholder="e.g., Hindi, English, Punjabi"
                  value={formData.languages}
                  onChange={(e) => updateForm('languages', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Additional Notes</label>
                <textarea
                  placeholder="Any additional information for travelers..."
                  value={formData.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
                />
              </div>

              {/* Info Box */}
              <div className="flex items-start gap-3 p-4 bg-teal-50 border border-teal-100 rounded-xl">
                <Shield className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-teal-800">
                  <p className="font-medium mb-1">Your listing will be reviewed</p>
                  <p className="text-teal-600">We'll verify your details and your listing will go live within 24 hours. No fees, no commission!</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-200"
            >
              <Check className="w-12 h-12 text-white" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-slate-900 mb-4"
            >
              Listing Submitted!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-slate-500 max-w-md mx-auto mb-8"
            >
              Your vehicle listing has been submitted for review. You'll receive a confirmation once it's live.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/transport-buddy')}
                className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-xl shadow-lg"
              >
                Browse Transports
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setCurrentStep(1); setFormData({ vehicleType: '', vehicleName: '', vehicleNumber: '', seatingCapacity: '', route: '', serviceArea: '', minPrice: '', maxPrice: '', priceType: 'per_trip', phone: '', whatsapp: '', features: [], languages: '', description: '', vehicleImages: [] }); }}
                className="px-8 py-3 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                Add Another Vehicle
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-between mt-8"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
              className={`px-6 py-3 font-semibold rounded-xl transition-all ${
                currentStep > 1
                  ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  : 'opacity-0 pointer-events-none'
              }`}
            >
              Back
            </motion.button>

            <motion.button
              whileHover={{ scale: canProceed() ? 1.02 : 1 }}
              whileTap={{ scale: canProceed() ? 0.98 : 1 }}
              onClick={() => {
                if (!canProceed()) return;
                if (currentStep === 3) handleSubmit();
                else setCurrentStep(currentStep + 1);
              }}
              disabled={!canProceed() || createLoading}
              className={`px-8 py-3 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 ${
                canProceed()
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:shadow-xl'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {createLoading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  Submitting...
                </>
              ) : currentStep === 3 ? (
                'Submit Listing'
              ) : (
                <>Continue</>
              )}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
