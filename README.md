# Travel Buddy 2.0 🌍✈️

Travel Buddy 2.0 is your ultimate travel companion application, designed to connect travelers, simplify trip planning, and discover the world around you. Built with a modern tech stack, it offers real-time interaction, interactive maps, and AI-powered features to make every journey memorable.

## ✨ Key Features

*   **👥 User Authentication**: Secure and seamless sign-up/login using **Clerk**.
*   **🗺️ Interactive Maps**:
    *   Find **Nearby Hotels**, **Tourist Places**, **Restaurants**, **Shopping**, **Emergency Services**, and **Transport**.
    *   Locate fellow travelers in your vicinity.
    *   Powered by **Google Maps API** with Places Autocomplete.
*   **💬 Real-Time Chat**: Connect instantly with other travelers using **Socket.io**.
*   **📝 Activity Management**:
    *   Create and manage travel activities with photo/video uploads.
    *   **AI-Generated Descriptions**: Automatically generate improved descriptions for your activities using **Groq AI**.
    *   Voice input support for activity descriptions.
*   **🤖 AI Trip Planner**:
    *   Generate personalized day-by-day itineraries based on your preferences.
    *   Customize by destination, dates, budget, travel style, and interests.
    *   Download complete itinerary as a text file.
    *   Powered by **Groq AI (Llama 3.1)**.
*   **📸 Travel Stories**:
    *   Share your travel moments with photos and captions.
    *   Like, comment, and interact with other travelers' posts.
    *   Instagram-style feed with location tagging.
*   **💳 Premium Subscription**: Unlock exclusive features with secure payments via **Razorpay**.
*   **🎨 Modern UI/UX**:
    *   Responsive design with **Tailwind CSS**.
    *   Consistent orange/amber color scheme.
    *   Glassmorphism effects and smooth animations.
    *   Sticky navbar with auto-hide on scroll.
*   **📍 Location Features**:
    *   Real-time location tracking and updates.
    *   Reverse geocoding for readable addresses.
    *   Distance-based traveler discovery.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React 18+ (Vite)
*   **Language**: JavaScript / JSX
*   **State Management**: Redux Toolkit & React Context
*   **Styling**: Tailwind CSS (v4), Lucide React (Icons)
*   **Authentication**: Clerk SDK
*   **Maps**: @react-google-maps/api
*   **HTTP Client**: Axios
*   **Real-time**: Socket.io Client
*   **Notifications**: React Hot Toast

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Language**: TypeScript
*   **Database**: MongoDB (with Mongoose ODM)
*   **Real-Time Communication**: Socket.io
*   **File Storage**: Cloudinary
*   **Data Validation**: Zod
*   **AI Integration**: Groq AI (Llama 3.1-8b-instant)
*   **Payment Gateway**: Razorpay
*   **Maps Integration**: Google Places API

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

# Payments (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# AI Services (Groq)
GROQ_API_KEY=your_groq_api_key

# Google Maps & Places
GOOGLE_PLACES_API_KEY=your_google_places_key
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
├── backend/                # Node.js/Express Backend
│   ├── controller/         # Request handlers
│   │   ├── activityController.ts
│   │   ├── aifeatureContoller.ts
│   │   └── userController.ts
│   ├── models/             # Mongoose schemas
│   │   ├── Activity.ts
│   │   ├── User.ts
│   │   └── Message.ts
│   ├── routes/             # API routes
│   │   ├── aiRoute.ts
│   │   ├── activityRoute.ts
│   │   └── userRoute.ts
│   ├── middlewares/        # Custom middlewares
│   ├── utils/              # Utility functions
│   ├── validation/         # Zod schemas
│   └── server.ts           # Entry point
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   └── navbar.jsx
│   │   ├── pages/          # Application pages
│   │   │   ├── AiFeatures/
│   │   │   │   └── AiTripPlanner.jsx
│   │   │   ├── Activity/
│   │   │   │   └── createActivity.jsx
│   │   │   ├── UserPosts.jsx
│   │   │   └── aboutUs.jsx
│   │   ├── redux/          # State management
│   │   │   ├── slices/
│   │   │   │   ├── userSlice.js
│   │   │   │   ├── activitySlice.js
│   │   │   │   └── aiSlice.js
│   │   │   ├── services/
│   │   │   │   └── api.js
│   │   │   └── store.js
│   │   ├── context/        # React Context
│   │   │   ├── socketContext.jsx
│   │   │   └── GoogleMapsContext.jsx
│   │   └── App.jsx
│   └── index.html
│
└── README.md               # Project Documentation
```

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

### 5. Razorpay
- Register at [razorpay.com](https://razorpay.com)
- Generate test/live mode keys

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
