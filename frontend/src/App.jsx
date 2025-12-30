import { Navigate, Route, Routes } from "react-router-dom";

// Common components
import AuthGuard from "./components/common/AuthGuard";
// Expense components
import SplitExpenses from "./components/expenses/SplitExpenses";
// Explore components
import EmergencyServices from "./components/explore/EmergencyServices";
import FoodNightlife from "./components/explore/FoodNightlife";
import NearbyActivities from "./components/explore/NearbyActivities";
import NearByTravellers from "./components/explore/NearbyTravellers";
import NearHotels from "./components/explore/NearHotels";
import ShoppingEntertainment from "./components/explore/ShoppingEntertainment";
import TouristPlaces from "./components/explore/TouristPlaces";
import TransportTravel from "./components/explore/TransportTravel";
// Layout components
import Layout from "./components/layout/Layout";
import { AudioPlaybackProvider } from "./context/AudioPlaybackContext";
// About pages
import AboutUs from "./pages/about/AboutUs";
// Activity pages
import ActivityDetails from "./pages/activity/ActivityDetails";
import ActivityPaymentStatus from "./pages/activity/ActivityPaymentStatus";
import BuySubscription from "./pages/activity/buySubscription";
import CreateActivity from "./pages/activity/createActivity";
import ActivityNearMe from "./pages/activity/getNearByActivity";
import JoinActivityGroup from "./pages/activity/JoinActivityGroup";
import JoinedActivities from "./pages/activity/JoinedActivities";
import ManageJoinedActivity from "./pages/activity/ManageJoinedActivity";
import MyCreatedActivities from "./pages/activity/MyCreatedActivites";
import ManageActivity from "./pages/activity/UpdateActivity";
// AI pages
import AiBuddyHomePage from "./pages/ai/AiBuddyHomePage";
import AiLocalGuide from "./pages/ai/AiLocalGuide";
import AiPackagePlanner from "./pages/ai/AiPackagePlanner";
import AiTripPlanner from "./pages/ai/AiTripPlanner";
import AiWeatherPlanner from "./pages/ai/AiWeatherPlanner";
// Auth pages
import CompleteRegistration from "./pages/auth/CompleteRegistration";
import SignInPage from "./pages/auth/SignIn";
import SignUpPage from "./pages/auth/SignUp";
// Chat pages
import ChatPage from "./pages/chat/ChatPage";
import GroupChat from "./pages/chat/GroupChat";
// Error pages
import NotFound from "./pages/error/NotFound";
// Guide pages
import BrowseGuides from "./pages/guide/BrowseGuides";
import GuideBookingPaymentStatus from "./pages/guide/GuideBookingPaymentStatus";
import GuideDashboard from "./pages/guide/GuideDashboard";
import GuideDetail from "./pages/guide/GuideDetail";
import GuideProfileSetup from "./pages/guide/GuideProfileSetup";
import MyGuideBookings from "./pages/guide/MyGuideBookings";
// Home pages
import HomePage from "./pages/home/UserHome";
// Legal pages
import CommunityGuidelines from "./pages/legal/CommunityGuidelines";
import CookiePolicy from "./pages/legal/CookiePolicy";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import RefundPolicy from "./pages/legal/RefundPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
// Payment pages
import PaymentStatus from "./pages/payment/PaymentStatus";
// Posts pages
import ArticleDetail from "./pages/posts/ArticleDetail";
import ManageArticle from "./pages/posts/ManageArticle";
import ManagePost from "./pages/posts/ManagePost";
import ReadArticle from "./pages/posts/RealArticle";
import UploadArticle from "./pages/posts/UploadArticle";
import UploadPost from "./pages/posts/UploadPost";
import UserPosts from "./pages/posts/UserPosts";
// User pages
import Connections from "./pages/user/Connections";
import ProfilePage from "./pages/user/profile";
import TravelerProfile from "./pages/user/TravelerProfile";


import Preloader from "./components/common/Preloader";

function App() {
  return (
    <>
      <Preloader />
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
        <Route path="split-expenses" element={<AuthGuard><SplitExpenses /></AuthGuard>} />
        <Route path="chat/:userId" element={<AuthGuard><ChatPage /></AuthGuard>} />
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
        <Route path="manage-activity/:id" element={<AuthGuard><ManageActivity /></AuthGuard>} />
        <Route path="manage-joined-activity/:id" element={<AuthGuard><ManageJoinedActivity /></AuthGuard>} />
        {/* Route removed: JoinActivityGroup is now a modal */}
        <Route path="activity-chat/:activityId" element={<AuthGuard><AudioPlaybackProvider><GroupChat /></AudioPlaybackProvider></AuthGuard>} />


        {/* Guide Routes */}
        <Route path="guides" element={<AuthGuard><BrowseGuides /></AuthGuard>} />
        <Route path="guide/:id" element={<AuthGuard><GuideDetail /></AuthGuard>} />
        <Route path="guide-setup" element={<AuthGuard><GuideProfileSetup /></AuthGuard>} />
        <Route path="guide-dashboard" element={<AuthGuard><GuideDashboard /></AuthGuard>} />
        <Route path="my-guide-bookings" element={<AuthGuard><MyGuideBookings /></AuthGuard>} />
        <Route path="guide-booking-payment-status" element={<AuthGuard><GuideBookingPaymentStatus /></AuthGuard>} />

        {/* Ai Features Routes */}
        <Route path="ai-buddy" element={<AuthGuard><AiBuddyHomePage /></AuthGuard>} />
        <Route path="ai-trip-planner" element={<AuthGuard><AiTripPlanner /></AuthGuard>} />
        <Route path="ai-packaging-planner" element={<AuthGuard><AiPackagePlanner /></AuthGuard>} />
        <Route path="ai-weather-planner" element={<AuthGuard><AiWeatherPlanner /></AuthGuard>} />
        <Route path="ai-local-guide" element={<AuthGuard><AiLocalGuide /></AuthGuard>} />
        <Route path="user-posts" element={<AuthGuard><UserPosts /></AuthGuard>} />
        <Route path="upload-post" element={<AuthGuard><UploadPost /></AuthGuard>} />
        <Route path="manage-posts" element={<AuthGuard><ManagePost /></AuthGuard>} />
        <Route path="read-article" element={<AuthGuard><ReadArticle /></AuthGuard>} />
        <Route path="article/:id" element={<AuthGuard><ArticleDetail /></AuthGuard>} />
        <Route path="upload-article" element={<AuthGuard><UploadArticle /></AuthGuard>} />
        <Route path="manage-article" element={<AuthGuard><ManageArticle /></AuthGuard>} />

        {/* Legal Pages */}
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<TermsOfService />} />
        <Route path="cookies" element={<CookiePolicy />} />
        <Route path="guidelines" element={<CommunityGuidelines />} />
        <Route path="refund" element={<RefundPolicy />} />

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Route>

    </Routes>
    </>
  );
}

export default App;
