# Travel Buddy 2.0 🌍✈️

**Travel Buddy 2.0** is your ultimate travel companion application, designed to connect travelers worldwide, simplify trip planning, and discover the world around you. Built with a modern MERN stack, it offers real-time interaction, AI-powered features, interactive maps, and a vibrant social platform for travel enthusiasts.

---

## ✨ Key Features

### 🔐 **User Authentication & Profile**
*   **Secure Authentication**: Seamless sign-up/login using **Clerk** with social auth support
*   **User Profiles**: Complete profile management with avatar, bio, and travel preferences
*   **Premium Subscriptions**: Unlock exclusive features with **Cashfree** payment integration
*   **Profile Dashboard**: Track your posts, articles, activities, and subscription status

### 📝 **Travel Articles & Blogging**
*   **Write & Publish Articles**: Share detailed travel guides and stories with rich text
*   **Article Management**: Full CRUD operations (Create, Read, Update, Delete)
*   **Cover Images**: Upload stunning cover photos for your articles
*   **Categories & Tags**: Organize articles by destination, travel type, and interests
*   **Engagement Features**: Like, comment, and share articles with the community
*   **Reading Stats**: Track views, read time, and engagement metrics
*   **Featured Articles**: Homepage spotlight for trending travel stories
*   **Author Profiles**: View author bio, stats, and all published articles

### 📸 **Travel Posts & Stories**
*   **Instagram-Style Feed**: Share quick travel moments with photos and captions
*   **Post Management**: Create, edit, and delete your travel posts
*   **Interactive Engagement**: Like, comment, and react to posts
*   **Location Tagging**: Tag your travel destinations on every post
*   **Media Gallery**: Upload multiple photos per post
*   **Social Feed**: Discover posts from travelers worldwide
*   **Community Stats**: Total stories, active travelers, countries visited

### 🎯 **Activity Management**
*   **Create Activities**: Organize travel activities, tours, and experiences
*   **Detailed Information**: Title, category, description, date/time, pricing, capacity
*   **Location Selection**: Interactive **Google Maps** with place search and click-to-select
*   **AI-Powered Descriptions**: Generate engaging descriptions with **Groq AI** (Llama 3.1)
*   **Voice Input**: Speech-to-text for activity descriptions
*   **Media Uploads**: Photos and video URL support via **Cloudinary**
*   **Activity Discovery**: Browse and search nearby activities
*   **Host Profiles**: View activity hosts and their offerings
*   **Booking Management**: Track activity capacity and availability

### 🗺️ **Interactive Maps & Discovery**
*   **Nearby Travelers**: Find and connect with travelers in your vicinity
*   **Nearby Hotels**: Discover accommodations with ratings, prices, and amenities
*   **Tourist Places**: Explore attractions, landmarks, and points of interest
*   **Restaurants & Dining**: Find places to eat with reviews and distance info
*   **Shopping & Services**: Locate shops, markets, and local services
*   **Emergency Services**: Quick access to hospitals, police, and emergency contacts
*   **Transport Options**: Find nearby transport, parking, and transit stations
*   **Real-time Location**: Auto-update location with distance-based discovery
*   **Custom Filters**: Filter by distance, category, price, and ratings
*   **Interactive Markers**: Click markers for detailed information
*   **Reverse Geocoding**: Display readable addresses with area and pincode
*   **Powered by**: **Google Maps API** with Places Autocomplete

### 🤖 **AI Trip Planner**
*   **Smart Itinerary Generation**: AI-powered day-by-day travel plans
*   **Custom Preferences**: Budget, travel style (budget/balanced/luxury), interests
*   **Destination Search**: Google Places autocomplete for destinations
*   **Flexible Duration**: Plan trips from 1 day to multiple weeks
*   **Activity Suggestions**: Personalized recommendations for each day
*   **Download Itinerary**: Export complete plan as formatted text file
*   **Budget Breakdown**: Estimated costs for accommodation, food, activities
*   **Powered by**: **Groq AI (Llama 3.1-8b-instant)**

### 💳 **Payment & Subscriptions**
*   **Cashfree Integration**: Secure payment processing for premium features
*   **Subscription Plans**: Multiple tiers with different benefits
*   **Payment Status**: Real-time payment verification and confirmation
*   **Auto-renewal**: Manage subscription renewals and cancellations
*   **Payment History**: Track all transactions and invoices
*   **Secure Checkout**: PCI-compliant payment flow

### 💬 **Real-Time Features**
*   **Live Chat**: Connect instantly with other travelers using **Socket.io**
*   **Real-time Notifications**: Get notified about likes, comments, and messages
*   **Live Location Updates**: Automatic location tracking every minute
*   **Online Status**: See who's currently active

### 🔒 **Legal & Compliance**
*   **Privacy Policy**: Comprehensive data protection guidelines
*   **Terms of Service**: Clear usage terms and conditions
*   **Cookie Policy**: Transparent cookie usage disclosure
*   **Refund Policy**: Fair refund and cancellation terms
*   **Community Guidelines**: Safe and respectful community standards

### 🎨 **Premium UI/UX**
*   **Modern Dark Theme**: Sleek dark mode with vibrant accent colors
*   **Responsive Design**: Perfect on mobile, tablet, and desktop
*   **Glassmorphism**: Beautiful frosted glass effects
*   **Smooth Animations**: Micro-interactions and transitions
*   **Sticky Navbar**: Auto-hide on scroll for immersive experience
*   **Custom Scrollbars**: Hidden scrollbars with maintained functionality
*   **Loading States**: Skeleton loaders and progress indicators
*   **Error Handling**: User-friendly error messages and fallbacks

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React 19.2 (Vite 7.2)
*   **Language**: JavaScript / JSX
*   **State Management**: Redux Toolkit 2.11 & React Context
*   **Styling**: Tailwind CSS v4.1, Lucide React (Icons)
*   **Authentication**: Clerk SDK 5.57
*   **Maps**: @react-google-maps/api 2.20
*   **HTTP Client**: Axios 1.13
*   **Real-time**: Socket.io Client 4.8
*   **Notifications**: React Hot Toast 2.6
*   **Routing**: React Router DOM 7.9
*   **Payments**: Cashfree Payments SDK
*   **3D Graphics**: Three.js 0.181
*   **Backend as a Service**: Firebase 12.6

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js 5.2
*   **Language**: TypeScript 5.9
*   **Database**: MongoDB (Mongoose ODM 9.0)
*   **Real-Time Communication**: Socket.io 4.8
*   **File Storage**: Cloudinary 2.8
*   **Data Validation**: Zod 4.1
*   **AI Integration**:
    *   Groq AI (Llama 3.1-8b-instant) via OpenAI SDK 6.14
    *   Google Generative AI 0.24
*   **Payment Gateway**: Cashfree
*   **Maps Integration**: Google Places API
*   **Authentication**: Clerk SDK Node 4.13
*   **File Upload**: Multer 2.0
*   **Dev Tools**: Nodemon, TS-Node, ESLint

---

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites
*   **Node.js** (v18 or higher recommended)
*   **MongoDB** (Local instance or Atlas connection string)
*   **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/Raturi-Sahil/TravelBuddy_2.0.git
cd TravelBuddy_2.0
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `backend` directory based on `.env.sample`. You will need keys for the following services:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173

# Authentication
CLERK_SECRET_KEY=your_clerk_secret_key

# Cloudinary (Image/Video Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payments (Cashfree)
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_ENV=sandbox  # or 'production'

# AI Services (Groq/xAI)
XAI_API_KEY=your_groq_api_key
GROQ_API_KEY=your_groq_api_key  # Same as XAI_API_KEY

# AI Services (Google Gemini - Optional)
GEMINI_KEY=your_google_gemini_key

# Google Maps & Places
GOOGLE_API=your_google_places_key
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

Start the frontend development server:

```bash
npm run dev
```

The application should now be running at `http://localhost:5173`.


## 📂 Project Structure

```
TravelBuddy_2.0/
├── backend/                    # Node.js/Express Backend (TypeScript)
│   ├── controller/             # Request handlers
│   │   ├── activityController.ts
│   │   ├── articleController.ts
│   │   ├── postController.ts
│   │   ├── aifeatureContoller.ts
│   │   ├── userController.ts
│   │   ├── paymentController.ts
│   │   └── chatController.ts
│   ├── models/                 # Mongoose schemas
│   │   ├── activityModel.ts
│   │   ├── articleModel.ts     # Travel articles/blogs
│   │   ├── postModel.ts        # Travel posts/stories
│   │   ├── userModel.ts
│   │   └── paymentModel.ts
│   ├── routes/                 # API routes
│   │   ├── activityRoutes.ts
│   │   ├── articleRoutes.ts
│   │   ├── postRoutes.ts
│   │   ├── aiRoute.ts
│   │   ├── userRoute.ts
│   │   ├── paymentRoutes.ts
│   │   └── chatRoutes.ts
│   ├── middlewares/            # Custom middlewares
│   │   └── authMiddleware.ts
│   ├── utils/                  # Utility functions
│   │   ├── cloudinary.ts
│   │   └── geocoding.ts
│   ├── validation/             # Zod schemas
│   │   ├── userValidation.ts
│   │   └── activityValidation.ts
│   ├── interfaces/             # TypeScript interfaces
│   ├── db/                     # Database configuration
│   ├── app.ts                  # Express app setup
│   ├── server.ts               # Entry point
│   ├── socket.ts               # Socket.io configuration
│   └── package.json

├── frontend/                   # React Frontend (Vite + React 19)
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/              # Application pages
│   │   │   ├── AiFeatures/
│   │   │   │   └── AiTripPlanner.jsx
│   │   │   ├── Activity/
│   │   │   │   ├── createActivity.jsx
│   │   │   │   ├── ActivityDetails.jsx
│   │   │   │   ├── getNearByActivity.jsx
│   │   │   │   └── ManageActivity.jsx
│   │   │   ├── UserPosts/
│   │   │   │   ├── UserPosts.jsx          # View all posts
│   │   │   │   ├── UploadPost.jsx         # Create new post
│   │   │   │   ├── ManagePost.jsx         # Edit/Delete posts
│   │   │   │   ├── RealArticle.jsx        # Article feed
│   │   │   │   ├── ArticleDetail.jsx      # Single article view
│   │   │   │   ├── UploadArticle.jsx      # Create article
│   │   │   │   └── ManageArticle.jsx      # Edit/Delete articles
│   │   │   ├── User/
│   │   │   │   ├── userProfile.jsx
│   │   │   │   ├── updateProfile.jsx
│   │   │   │   ├── NearByTravellers.jsx   # Map view
│   │   │   │   ├── NearHotels.jsx         # Hotels map
│   │   │   │   ├── NearTouristPlace.jsx   # Tourist attractions
│   │   │   │   └── subscriptionPage.jsx
│   │   │   ├── miscellaneous/
│   │   │   │   ├── PrivacyPolicy.jsx
│   │   │   │   ├── TermsOfService.jsx
│   │   │   │   ├── CookiePolicy.jsx
│   │   │   │   ├── RefundPolicy.jsx
│   │   │   │   └── CommunityGuidelines.jsx
│   │   │   ├── userHome.jsx
│   │   │   ├── aboutUs.jsx
│   │   │   └── paymentStatus.jsx
│   │   ├── redux/              # State management
│   │   │   ├── slices/
│   │   │   │   ├── userSlice.js
│   │   │   │   ├── activitySlice.js
│   │   │   │   ├── articleSlice.js
│   │   │   │   ├── postSlice.js
│   │   │   │   └── aiSlice.js
│   │   │   ├── services/
│   │   │   │   └── api.js
│   │   │   └── store.js
│   │   ├── context/            # React Context
│   │   │   ├── socketContext.jsx
│   │   │   └── GoogleMapsContext.jsx
│   │   ├── utils/              # Helper functions
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   ├── public/
│   ├── index.html
│   └── package.json

├── .gitignore
├── docker-compose.yml          # Docker configuration
└── README.md                   # This file
```

---


## 🎯 Core Features Deep Dive

### AI Trip Planner
- **Smart Itinerary Generation**: Creates personalized day-by-day travel plans
- **Customization Options**: Budget, travel style (budget/balanced/luxury), interests
- **Interactive Form**: Google Places autocomplete for destinations
- **Download Feature**: Export itinerary as formatted text file
- **Beautiful UI**: Scrollable itinerary viewer with orange/amber theme

### Activity Management
- **Rich Creation Form**: Title, category, date/time, pricing, capacity
- **Location Selection**: Google Maps with place search and click-to-select
- **AI Description**: Generate engaging descriptions with one click
- **Voice Input**: Speech-to-text for activity descriptions
- **Media Upload**: Photos and video URL support

### Travel Stories
- **Social Feed**: Instagram-style post cards with images
- **Interactions**: Like, comment, and share travel moments
- **Location Tags**: Every post tagged with travel destination
- **Community Stats**: Total stories, active travelers, countries visited

### Real-time Features
- **Live Location**: Automatic location updates every minute
- **Nearby Travelers**: Find travelers within customizable radius
- **Socket.io Integration**: Real-time notifications and updates

## 🔑 API Keys Setup Guide

### 1. Clerk (Authentication)
- Visit [clerk.com](https://clerk.com)
- Create a new application
- Copy the Publishable Key (frontend) and Secret Key (backend)

### 2. Google Maps & Places
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Enable Maps JavaScript API and Places API
- Create API credentials
- Restrict keys for security

### 3. Groq AI
- Sign up at [groq.com](https://groq.com)
- Generate an API key
- Uses Llama 3.1-8b-instant model

### 4. Cloudinary
- Create account at [cloudinary.com](https://cloudinary.com)
- Get cloud name, API key, and secret from dashboard

### 5. Cashfree
- Register at [cashfree.com](https://www.cashfree.com)
- Generate App ID and Secret Key from dashboard

## 🤝 Contributing

Contributions are welcome! If you'd like to improve Travel Buddy, please fork the repository and submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Contributors

- **Sahil Raturi** - [GitHub](https://github.com/Raturi-Sahil)

## 🙏 Acknowledgments

- Clerk for authentication services
- Groq for AI capabilities
- Google for Maps and Places API
- Cloudinary for media storage
- All open-source contributors
