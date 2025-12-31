# Deployment Guide 🚀

Guidelines for deploying Travel Buddy 2.0 to production.

## Recommended Stack
*   **Frontend**: Vercel or Netlify (Static Site Hosting).
*   **Backend**: Render, Railway, or VPS (Node.js runtime).
*   **Database**: MongoDB Atlas.

## Frontend Deployment (Vercel)
1.  Push your code to GitHub.
2.  Import the project in Vercel.
3.  Set the `Root Directory` to `frontend`.
4.  Add Environment Variables:
    *   `VITE_API_URL`: Your production backend URL.
    *   `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk Production Key.
    *   `VITE_GOOGLE_MAPS_API_KEY`: Your Production Maps Key.
5.  Deploy.

## Backend Deployment (Render)
1.  Connect your GitHub repo to Render.
2.  Create a "Web Service".
3.  Set `Root Directory` to `backend`.
4.  Build Command: `npm install && npm run build` (Ensure you have a build script if using TS, usually `tsc`).
    *   *Note*: If you are running with `ts-node` in production (not recommended for high load), you can use `npm install`.
5.  Start Command: `npm start` (Make sure this runs the compiled JS or `ts-node src/server.ts`).
6.  Add Environment Variables:
    *   Copy all variables from your local `.env`.
    *   Update `FRONTEND_URL` to your Vercel URL.
    *   Set `NODE_ENV` to `production`.

## Pre-Deployment Checklist
*   [ ] Remove `console.log` statements.
*   [ ] Ensure `FRONTEND_URL` is correct in the Backend CORS config.
*   [ ] Ensure MongoDB Atlas IP whitelist includes your deployment server (or allow 0.0.0.0/0).
*   [ ] Verify Payment Gateway is in "Production" mode.
