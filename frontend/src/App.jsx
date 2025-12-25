import { Navigate,Route, Routes } from "react-router-dom";

import AuthGuard from "./components/AuthGuard";
import EmergencyServices from "./components/EmergencyServices";
import FoodNightlife from "./components/FoodNightlife";
import Layout from "./components/layout";
import NearbyActivities from "./components/NearbyActivities";
import NearByTravellers from "./components/NearByTravellers";
import NearHotels from "./components/NearHotels";
import ShoppingEntertainment from "./components/ShoppingEntertainment";
import TouristPlaces from "./components/TouristPlaces";
import TransportTravel from "./components/TransportTravel";
import AboutUs from "./pages/aboutUs";
import ActivityDetails from "./pages/Activity/ActivityDetails";
import ActivityPaymentStatus from "./pages/Activity/ActivityPaymentStatus";
import BuySubscription from "./pages/Activity/buySubscription";
import CreateActivity from "./pages/Activity/createActivity";
import ActivityNearMe from "./pages/Activity/getNearByActivity";
import JoinedActivities from "./pages/Activity/JoinedActivities";
import MyCreatedActivities from "./pages/Activity/MyCreatedActivites";
import ManageActivity from "./pages/Activity/UpdateActivity";
import AiTripPlanner from "./pages/AiFeatures/AiTripPlanner";
import CommunityGuidelines from "./pages/miscellaneous/CommunityGuidelines";
import CookiePolicy from "./pages/miscellaneous/CookiePolicy";
import PrivacyPolicy from "./pages/miscellaneous/PrivacyPolicy";
import RefundPolicy from "./pages/miscellaneous/RefundPolicy";
import TermsOfService from "./pages/miscellaneous/TermsOfService";
import PaymentStatus from "./pages/paymentStatus";
import CompleteRegistration from "./pages/User/completeRegistration";
import Connections from "./pages/User/Connections";
import ProfilePage from "./pages/User/profile";
import SignUpPage from "./pages/User/signUp";
import SignInPage from "./pages/User/singIn";
import TravelerProfile from "./pages/User/TravelerProfile";
import HomePage from "./pages/userHome";
import ManagePost from "./pages/UserPosts/ManagePost";
import ReadArticle from "./pages/UserPosts/RealArticle";
import UploadPost from "./pages/UserPosts/UploadPost";
import UserPosts from "./pages/UserPosts/UserPosts";
import ManageArticle from "./pages/UserPosts/ManageArticle";
import UploadArticle from "./pages/UserPosts/UploadArticle";
import ArticleDetail from "./pages/UserPosts/ArticleDetail";
import NotFound from "./pages/NotFound";

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
        <Route path="connections" element={<AuthGuard><Connections /></AuthGuard>} />
        <Route path="complete-registration" element={<CompleteRegistration />} />
        <Route path="about-us" element={<AboutUs />} />

        {/* Map Routes */}
        <Route path="map" element={<AuthGuard><NearByTravellers /></AuthGuard>} />
        <Route path="map/nearby-activities" element={<AuthGuard><NearbyActivities /></AuthGuard>} />
        <Route path="map/hotels" element={<AuthGuard><NearHotels /></AuthGuard>} />
        <Route path="map/tourist-places" element={<AuthGuard><TouristPlaces /></AuthGuard>} />
        <Route path="map/food-nightlife" element={<AuthGuard><FoodNightlife /></AuthGuard>} />
        <Route path="map/shopping" element={<AuthGuard><ShoppingEntertainment /></AuthGuard>} />
        <Route path="map/emergency" element={<AuthGuard><EmergencyServices /></AuthGuard>} />
        <Route path="map/transport" element={<AuthGuard><TransportTravel /></AuthGuard>} />
        <Route path="traveler/:id" element={<AuthGuard><TravelerProfile /></AuthGuard>} />

        {/* Activity Routes */}
        <Route path="create-activity" element={<AuthGuard><CreateActivity /></AuthGuard>} />
        <Route path="activities" element={<AuthGuard><ActivityNearMe /></AuthGuard>} />
        <Route path="joined-activities" element={<AuthGuard><JoinedActivities /></AuthGuard>} />
        <Route path="my-activities" element={<AuthGuard><MyCreatedActivities /></AuthGuard>} />
        <Route path="subscription" element={<AuthGuard><BuySubscription /></AuthGuard>} />
        <Route path="payment-status" element={<AuthGuard><PaymentStatus /></AuthGuard>} />
        <Route path="activity-payment-status" element={<AuthGuard><ActivityPaymentStatus /></AuthGuard>} />
        <Route path="activity/:id" element={<AuthGuard><ActivityDetails /></AuthGuard>} />
        <Route path="manage-activity/:id" element={<AuthGuard><ManageActivity /></AuthGuard>} />

        {/* Ai Features Routes */}
        <Route path="ai-trip-planner" element={<AuthGuard><AiTripPlanner /></AuthGuard>} />
        <Route path="user-posts" element={<AuthGuard><UserPosts /></AuthGuard>} />
        <Route path="upload-post" element={<AuthGuard><UploadPost /></AuthGuard>} />
        <Route path="manage-posts" element={<AuthGuard><ManagePost /></AuthGuard>} />
        <Route path="read-article" element={<AuthGuard><ReadArticle /></AuthGuard>} />
        <Route path="article/:id" element={<AuthGuard><ArticleDetail /></AuthGuard>} />
        <Route path="upload-article" element={<AuthGuard><UploadArticle /></AuthGuard>} />
        <Route path="manage-article" element={<AuthGuard><ManageArticle /></AuthGuard>} />

        {/* Miscellaneous/Legal Pages */}
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<TermsOfService />} />
        <Route path="cookies" element={<CookiePolicy />} />
        <Route path="guidelines" element={<CommunityGuidelines />} />
        <Route path="refund" element={<RefundPolicy />} />

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Route>

    </Routes>
  );
}

export default App;
