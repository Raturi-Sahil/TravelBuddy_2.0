import { Navigate,Route, Routes } from "react-router-dom";

import AuthGuard from "./components/AuthGuard";
import Layout from "./components/layout";
import CompleteRegistration from "./pages/User/completeRegistration";
import ProfilePage from "./pages/User/profile";
import SignUpPage from "./pages/User/signUp";
import SignInPage from "./pages/User/singIn";
import AboutUs from "./pages/aboutUs";
import HomePage from "./pages/userHome";
import NearByTravellers from "./components/NearByTravellers";
import NearHotels from "./components/NearHotels";
import TouristPlaces from "./components/TouristPlaces";

function App() {
  return (
    <Routes >
     <Route path="/" element={<Layout />} >
       <Route index element={
         <AuthGuard>
           <HomePage />
         </AuthGuard>
       } />
       <Route path="sign-up/*" element={<SignUpPage />} />
       <Route path="sign-in/*" element={<SignInPage />} />
       <Route path="profile" element={
         <AuthGuard>
           <ProfilePage />
         </AuthGuard>
       } />
       <Route path="complete-registration" element={<CompleteRegistration />} />
       <Route path="about-us" element={<AboutUs />} />

       {/* Map Routes */}
       <Route path="map" element={<AuthGuard><NearByTravellers /></AuthGuard>} />
       <Route path="map/hotels" element={<AuthGuard><NearHotels /></AuthGuard>} />
       <Route path="map/tourist-places" element={<AuthGuard><TouristPlaces /></AuthGuard>} />
     </Route>
    </Routes>
  );
}

export default App;

