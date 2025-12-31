# Installation and Setup Guide 🛠️

Follow these steps to set up the **Travel Buddy 2.0** development environment on your local machine.

## Prerequisites

Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   [MongoDB](https://www.mongodb.com/try/download/community) (Local) or a [MongoDB Atlas](https://www.mongodb.com/atlas) account.
*   Git

## 1. Clone the Repository

```bash
git clone https://github.com/Raturi-Sahil/TravelBuddy_2.0.git
cd TravelBuddy_2.0
```

## 2. Backend Configuration

1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Create a `.env` file in the `backend` directory. Use the provided `.env.sample` as a reference, or copy the variables below:

    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    FRONTEND_URL=http://localhost:5173

    # Authentication (Clerk)
    CLERK_SECRET_KEY=your_clerk_secret_key

    # Cloudinary (Media Storage)
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret

    # Payments (Cashfree)
    CASHFREE_APP_ID=your_cashfree_app_id
    CASHFREE_SECRET_KEY=your_cashfree_secret_key
    CASHFREE_ENV=sandbox

    # AI Services
    GROQ_API_KEY=your_groq_api_key
    GEMINI_KEY=your_google_gemini_key

    # Google Services
    GOOGLE_PLACES_API_KEY=your_google_places_key
    ```

4.  Start the backend server:
    ```bash
    npm run dev
    ```

## 3. Frontend Configuration

1.  Open a new terminal and navigate to the frontend folder:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Create a `.env` file in the `frontend` directory:

    ```env
    VITE_API_URL=http://localhost:5000
    VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
    ```

4.  Start the frontend development server:
    ```bash
    npm run dev
    ```

## 4. Verification

*   Open your browser and visit `http://localhost:5173`.
*   Ensure the backend is running at `http://localhost:5000`.
*   Check the console for any connection errors (Database, APIs).

You are now ready to develop! 🚀
