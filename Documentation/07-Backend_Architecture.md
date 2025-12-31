# Backend Architecture ⚙️

The backend is a robust **Node.js** application using **Express.js** and **TypeScript**. It serves as the data API and orchestrator for external services.

## 🏗️ Core Principles
*   **TypeScript**: We use strong typing for better maintainability and error catching.
*   **Controller-Service Pattern**: Business logic is primarily housed in controllers (though we are moving towards a Service layer for complexity).
*   **Mongoose ODM**: We use Mongoose schemes to model data in MongoDB.

## 🗄️ Database Models (`backend/models/`)
*   `User`: Stores profile info, Clerk ID, preferences.
*   `Activity`: Stores event details, location (GeoJSON), price, host.
*   `Post`: properites for image, caption, likes, comments array.
*   `Article`: Content, cover image, author reference.
*   `Payment`: Transaction records from Cashfree.

## 🛡️ Authentication & Security
*   **Clerk**: We delegate identity management to Clerk.
*   **Middleware**:
    *   `verifyClerk`: Validates the session token.
    *   `requireProfile`: Ensures the authenticated user has a completed profile in our database before allowing actions.
*   **Zod**: We use Zod for runtime validation of request bodies (e.g., `userValidation.ts`).

## 🔌 External Integrations
*   **Cloudinary**: For storing user uploads (profile pics, post images).
*   **Google Gemini & Groq**: For AI generation features.
*   **Google Maps Platform**: For Place Autocomplete and Geocoding.
*   **Cashfree**: For handling payments.

## 📡 Real-Time (`socket.ts`)
We use `socket.io` to handle real-time events:
*   `setupSocket`: Initializes the socket server.
*   Events: `join_room`, `receive_message`, `notification`.
