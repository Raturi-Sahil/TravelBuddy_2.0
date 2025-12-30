// ... (imports remain)
import { useAuth, useUser } from '@clerk/clerk-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { COUNTRIES, GENDERS, LANGUAGE_LEVELS, LANGUAGES } from '../../data/enums';
import { useUserActions } from '../../redux/hooks/useUser';

// ... (helper functions remain)
const isNetworkError = (err) => {
  if (!err) return false;
  // No status means network error (connection refused, timeout, etc.)
  if (!err.status && !err.response?.status) return true;
  // Axios network errors
  if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') return true;
  if (err.message?.includes('Network Error')) return true;
  if (err.message?.includes('ERR_CONNECTION_REFUSED')) return true;
  return false;
};

export default function CompleteRegistration() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const navigate = useNavigate();
  // Fixed unused error variable syntax
  const { registerUser, fetchProfile, isRegistering } = useUserActions();
  const hasChecked = useRef(false);

  const [formData, setFormData] = useState({
    mobile: '',
    dob: '',
    gender: '',
    nationality: '',
    languages: [],
  });

  // New Language State
  const [newLanguage, setNewLanguage] = useState({ name: '', level: 'Beginner' });

  // UI States
  const [showForm, setShowForm] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  // Search States
  const [languageSearch, setLanguageSearch] = useState('');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const [nationalitySearch, setNationalitySearch] = useState('');
  const [showNationalityDropdown, setShowNationalityDropdown] = useState(false);

  // Removed Interest States

  const languageRef = useRef(null);
  const nationalityRef = useRef(null);
  // Removed Interest Ref

  // Filter lists
  const filteredLanguages = LANGUAGES.filter(lang =>
    lang.toLowerCase().includes(languageSearch.toLowerCase())
  );
  const filteredCountries = COUNTRIES.filter(country =>
    country.toLowerCase().includes(nationalitySearch.toLowerCase())
  );
  // Removed Filtered Interests

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (nationalityRef.current && !nationalityRef.current.contains(event.target)) {
        setShowNationalityDropdown(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if user already exists in backend
  const checkExistingUser = useCallback(async () => {
    if (!isAuthLoaded || !isUserLoaded || !isSignedIn) return;

    setConnectionError(false);
    setIsCheckingUser(true);

    try {
      await fetchProfile();
      // User exists in backend, redirect to profile
      navigate('/profile', { replace: true });
    } catch (err) {
      if (isNetworkError(err)) {
        setConnectionError(true);
        setShowForm(false);
        return;
      }

      const status = err?.status || err?.response?.status;

      if (status === 404 || status === 403) {
        setShowForm(true);
      } else if (status === 401) {
        navigate('/sign-in', { replace: true });
      } else {
        setConnectionError(true);
        setShowForm(false);
      }
    } finally {
      setIsCheckingUser(false);
    }
  }, [isAuthLoaded, isUserLoaded, isSignedIn, fetchProfile, navigate]);

  useEffect(() => {
    if (!hasChecked.current && isAuthLoaded && isUserLoaded && isSignedIn) {
      hasChecked.current = true;
      checkExistingUser();
    }
  }, [isAuthLoaded, isUserLoaded, isSignedIn, checkExistingUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.mobile || formData.mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!formData.dob) {
      toast.error('Please enter your date of birth');
      return;
    }

    if (!formData.gender) {
      toast.error('Please select your gender');
      return;
    }

    if (!formData.nationality) {
      toast.error('Please select your nationality from the list');
      return;
    }

    if (formData.languages.length === 0) {
      toast.error('Please add at least one language');
      return;
    }

    try {
      await registerUser(formData);
      toast.success('Registration completed successfully!');
      navigate('/profile', { replace: true });
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : (err?.message || 'Registration failed. Please try again.');
      toast.error(errorMessage);
    }
  };

  if (!isAuthLoaded || !isUserLoaded || isCheckingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">
            Unable to connect to the server. Please check your connection and try again.
          </p>
          <button
            onClick={() => {
              hasChecked.current = false;
              setConnectionError(false);
              checkExistingUser();
            }}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isSignedIn || !showForm) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-indigo-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">

      {/* Header Section */}
      <div className="text-center mb-8 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-3">
          Welcome to <span className="text-orange-600">Travel Buddy</span>
        </h1>
        <p className="text-lg text-gray-600">
          Let's build your profile to connect you with the perfect travel companions.
        </p>
      </div>

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 min-h-[600px]">

          {/* Left Sidebar - Visual/Info */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-8 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-24 h-24 rounded-full border-4 border-white/30 bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 shadow-lg">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || 'User'}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold">
                    {(user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || 'U').toUpperCase()}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {user?.firstName ? `Hi, ${user.firstName}!` : 'Hello!'}
              </h2>
              <p className="text-orange-100 text-sm">
                Complete these final steps to unlock your full travel potential.
              </p>
            </div>

            <div className="relative z-10 mt-12 space-y-4">
              <div className="flex items-center gap-3 text-sm text-orange-100">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">1</div>
                <span>Personal Details</span>
              </div>
               <div className="flex items-center gap-3 text-sm text-orange-100">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">2</div>
                <span>Travel Preferences</span>
              </div>
               <div className="flex items-center gap-3 text-sm text-orange-100">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">3</div>
                <span>Languages</span>
              </div>
            </div>

            {/* Decorative circles */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-black/10 blur-3xl"></div>
          </div>

          {/* Right Content - Form */}
          <div className="col-span-1 md:col-span-2 p-8 md:p-10 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Mobile */}
                <div className="space-y-1">
                  <label htmlFor="mobile" className="block text-sm font-semibold text-gray-700">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="10-digit number"
                    maxLength={10}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                    required
                  />
                </div>

                {/* DOB */}
                 <div className="space-y-1">
                  <label htmlFor="dob" className="block text-sm font-semibold text-gray-700">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                    required
                  />
                </div>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Gender */}
                 <div className="space-y-1">
                  <label htmlFor="gender" className="block text-sm font-semibold text-gray-700">
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none appearance-none"
                      required
                    >
                      <option value="">Select Gender</option>
                      {GENDERS.map((gender) => (
                        <option key={gender} value={gender}>
                          {gender}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                {/* Nationality */}
                 <div className="space-y-1 relative" ref={nationalityRef}>
                  <label htmlFor="nationality" className="block text-sm font-semibold text-gray-700">
                    Nationality
                  </label>
                  <input
                    type="text"
                    id="nationality"
                    value={nationalitySearch}
                    onChange={(e) => {
                      setNationalitySearch(e.target.value);
                      setShowNationalityDropdown(true);
                      setFormData(prev => ({ ...prev, nationality: '' }));
                    }}
                    onFocus={() => setShowNationalityDropdown(true)}
                    placeholder="Search country..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                    autoComplete="off"
                  />
                  {showNationalityDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((country) => (
                          <button
                            key={country}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, nationality: country }));
                              setNationalitySearch(country);
                              setShowNationalityDropdown(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-orange-50 text-gray-700 text-sm transition-colors"
                          >
                            {country}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500 text-sm">No countries found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Languages known <span className="text-gray-400 font-normal">(Add at least one)</span>
                </label>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div ref={languageRef} className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Type a language..."
                        value={languageSearch}
                        onChange={(e) => {
                          setLanguageSearch(e.target.value);
                          setShowLanguageDropdown(true);
                          setNewLanguage(prev => ({ ...prev, name: '' }));
                        }}
                        onFocus={() => setShowLanguageDropdown(true)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                        autoComplete="off"
                      />
                      {showLanguageDropdown && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                           {filteredLanguages.length > 0 ? (
                            filteredLanguages.map((lang) => (
                              <button
                                key={lang}
                                type="button"
                                onClick={() => {
                                  setNewLanguage(prev => ({ ...prev, name: lang }));
                                  setLanguageSearch(lang);
                                  setShowLanguageDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-orange-50 text-gray-700 text-sm transition-colors"
                              >
                                {lang}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-gray-500 text-sm">No languages found</div>
                          )}
                        </div>
                      )}
                    </div>

                    <select
                      value={newLanguage.level}
                      onChange={(e) => setNewLanguage({ ...newLanguage, level: e.target.value })}
                      className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                    >
                      {LANGUAGE_LEVELS.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        if (newLanguage.name.trim()) {
                          if (formData.languages.some(l => l.name === newLanguage.name.trim())) {
                            toast.error('Language already added');
                            return;
                          }
                          setFormData({
                            ...formData,
                            languages: [...formData.languages, { ...newLanguage, name: newLanguage.name.trim() }]
                          });
                          setNewLanguage({ name: '', level: 'Beginner' });
                          setLanguageSearch('');
                        } else {
                           toast.error('Please select a language');
                        }
                      }}
                       className="px-6 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
                    >
                      Add
                    </button>
                  </div>

                  {/* Selected Languages Chips */}
                  {formData.languages.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {formData.languages.map((lang, index) => (
                        <div key={index} className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
                          <span className="text-sm font-medium text-gray-800">{lang.name}</span>
                          <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full">{lang.level}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newLangs = [...formData.languages];
                              newLangs.splice(index, 1);
                              setFormData({ ...formData, languages: newLangs });
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                   {formData.languages.length === 0 && (
                     <div className="text-xs text-gray-400 italic text-center py-2">No languages added yet</div>
                   )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                  {isRegistering ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

