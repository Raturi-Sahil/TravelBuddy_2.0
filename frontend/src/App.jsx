import { Navigate,Route, Routes } from "react-router-dom";

import AuthGuard from "./components/AuthGuard";
import EmergencyServices from "./components/EmergencyServices";
import FoodNightlife from "./components/FoodNightlife";
import Layout from "./components/layout";
import NearByTravellers from "./components/NearByTravellers";
import NearHotels from "./components/NearHotels";
import ShoppingEntertainment from "./components/ShoppingEntertainment";
import TouristPlaces from "./components/TouristPlaces";
import TransportTravel from "./components/TransportTravel";
import AboutUs from "./pages/aboutUs";
import ActivityDetails from "./pages/Activity/ActivityDetails";
import BuySubscription from "./pages/Activity/buySubscription";
import CreateActivity from "./pages/Activity/createActivity";
import ActivityNearMe from "./pages/Activity/getNearByActivity";
import PaymentStatus from "./pages/paymentStatus";
import CompleteRegistration from "./pages/User/completeRegistration";
import ProfilePage from "./pages/User/profile";
import SignUpPage from "./pages/User/signUp";
import SignInPage from "./pages/User/singIn";
import HomePage from "./pages/userHome";

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
       <Route path="map/food-nightlife" element={<AuthGuard><FoodNightlife /></AuthGuard>} />
       <Route path="map/shopping" element={<AuthGuard><ShoppingEntertainment /></AuthGuard>} />
       <Route path="map/emergency" element={<AuthGuard><EmergencyServices /></AuthGuard>} />
       <Route path="map/transport" element={<AuthGuard><TransportTravel /></AuthGuard>} />

       {/* Activity Routes */}
       <Route path="create-activity" element={<AuthGuard><CreateActivity /></AuthGuard>} />
       <Route path="activities" element={<AuthGuard><ActivityNearMe /></AuthGuard>} />
       <Route path="subscription" element={<AuthGuard><BuySubscription /></AuthGuard>} />
       <Route path="payment-status" element={<AuthGuard><PaymentStatus /></AuthGuard>} />
       <Route path="activity/:id" element={<AuthGuard><ActivityDetails /></AuthGuard>} />
     </Route>
    </Routes>
  );
}
// sign up and sign in pages

export default App;

