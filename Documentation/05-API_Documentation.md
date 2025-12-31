# API Documentation 📡

The backend provides a RESTful API. All endpoints are prefixed with the base URL (typically `http://localhost:5000` or your production URL).

## Authentication
Most endpoints require authentication via Clerk headers. The middleware verifies the user before processing requests.

---

## 👤 User Routes (`/users`)
*   `POST /users/register`: Register a new user profile.
*   `GET /users/profile`: Get the logged-in user's profile.
*   `PATCH /users/update-profile`: Update profile info (Bio, Avatar, Cover Image).
*   `GET /users/nearby`: Get list of nearby travelers.
*   `GET /users/:id`: Get public profile of a specific user.

## 🚵 Activity Routes (`/activities`)
*   `POST /activities/create`: Create a new travel activity.
*   `GET /activities/all`: List available activities.
*   `GET /activities/nearby`: Find activities near a location.
*   `GET /activities/:id`: Get details of a specific activity.
*   `POST /activities/:id/join`: Join an activity.

## 🤖 AI Routes (`/ai`)
*   `POST /ai/generate-trip`: Generate a trip itinerary.
*   `POST /ai/generate-description`: Generate text for activity descriptions.

## 📸 Post Routes (`/posts`)
*   `POST /posts/create`: Upload a new travel story/post.
*   `GET /posts/all`: Get the social feed.
*   `GET /posts/user/:userId`: Get posts by a specific user.
*   `DELETE /posts/:id`: Delete a post.

## 📝 Article Routes (`/articles`)
*   `POST /articles/create`: Publish a new travel article.
*   `GET /articles`: Get all articles.
*   `GET /articles/:id`: Read a specific article.
*   `PATCH /articles/:id`: Edit an article.

## 🗺️ Maps/Places Routes (`/places`)
*   `GET /places/nearby`: Search for nearby places (hotels, restaurants, etc.) via Google APIs.

## 💬 Chat Routes (`/chat`)
*   `POST /chat/room`: Create or get a private chat room.
*   `GET /chat/history/:roomId`: Get message history.

## 💰 Subscription Routes (`/subscription`)
*   `POST /subscription/create-order`: Initiate a payment for subscription.
*   `POST /subscription/verify`: Verify payment status.

---

*Note: This is a high-level summary. Please check the code in `backend/routes/` for exact parameters and validation rules.*
