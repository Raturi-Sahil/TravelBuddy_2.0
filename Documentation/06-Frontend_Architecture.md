# Frontend Architecture 🖥️

The frontend is built using **React 19** and **Vite**, designed for performance and a modern user experience.

## 🎨 Styling System
*   **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
*   **Icons**: `lucide-react` for consistent iconography.
*   **Design Language**:
    *   **Colors**: Uses an amber/orange primary palette against a dark/gray background.
    *   **Components**: Glassmorphism effects (blurs, semi-transparent backgrounds) are frequently used for cards and modals.

## 🧩 Key Components (`src/components/`)
*   `Navbar.jsx`: Responsive navigation bar. Handles authentication state and routing.
*   `Footer.jsx`: Application footer.
*   `ui/`: Atomic components like Buttons, Inputs, and Modals.

## 📄 Pages & Routes (`src/pages/`)
The application is divided into feature-based directories:

### 1. AI Trip Planner (`AiFeatures/`)
*   `AiTripPlanner.jsx`: The main interface for the trip generator. Contains the form input and the itinerary display.

### 2. Activities (`Activity/`)
*   `createActivity.jsx`: Form for hosts to create new listings.
*   `getNearByActivity.jsx`: Map and list view of available activities.
*   `ActivityDetails.jsx`: Detailed view of a single activity.

### 3. Social (`UserPosts/`)
*   `UserPosts.jsx`: The main social feed (Instagram style).
*   `UploadPost.jsx`: Interface for creating new posts.
*   `RealArticle.jsx`: The blog/article listing page.
*   `ArticleDetail.jsx`: Reading view for articles.

### 4. User Profile (`User/`)
*   `userProfile.jsx`: User's dashboard showing their posts, stats, and info.
*   `updateProfile.jsx`: Settings page to edit profile details.

## 📦 State Management (`src/redux/`)
We use **Redux Toolkit** for managing global state.
*   `userSlice.js`: Current user data, authentication status.
*   `activitySlice.js`: List of activities, current activity details.
*   `postSlice.js`: Social feed data.
*   `aiSlice.js`: Generated itineraries and AI responses.

## 🗺️ Context Providers
*   `GoogleMapsContext`: Loads the Google Maps script once and provides it to map components.
*   `SocketContext`: Manages the WebSocket connection for real-time chat and notifications.
