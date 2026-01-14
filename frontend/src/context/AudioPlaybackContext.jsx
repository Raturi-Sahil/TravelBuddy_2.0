import { useRef } from "react";

import { AudioPlaybackContext } from "./audioPlaybackContextValue";

// Provider - only component in this file for Fast Refresh compatibility
export default function AudioPlaybackProvider({ children }) {
    // This will store the currently playing audio element
    const activeAudioRef = useRef(null);

    return (
        <AudioPlaybackContext.Provider value={{ activeAudioRef }}>
            {children}
        </AudioPlaybackContext.Provider>
    );
}
