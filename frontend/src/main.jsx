import './index.css';

import { ClerkProvider } from "@clerk/clerk-react";
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import ScrollToTop from './components/common/ScrollToTop.jsx';
import AudioPlaybackProvider from './context/AudioPlaybackContext.jsx';
import { GoogleMapsProvider } from './context/GoogleMapsContext.jsx';
import { SocketContextProvider } from './context/socketContext.jsx';
import store from './redux/store.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ClerkProvider
    publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
    signInFallbackRedirectUrl="/"
    signUpFallbackRedirectUrl="/complete-registration"
  >
    <Provider store={store}>
      <GoogleMapsProvider>
        <SocketContextProvider>
          <AudioPlaybackProvider>
            <BrowserRouter>
              <ScrollToTop />
              <App />
              <Toaster />
            </BrowserRouter>
          </AudioPlaybackProvider>
        </SocketContextProvider>
      </GoogleMapsProvider>
    </Provider>
  </ClerkProvider>
);
