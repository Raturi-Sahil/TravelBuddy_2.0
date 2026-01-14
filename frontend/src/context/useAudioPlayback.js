import { useContext } from "react";

import { AudioPlaybackContext } from "./audioPlaybackContextValue";

// Custom hook for easy usage
export function useAudioPlayback() {
    const context = useContext(AudioPlaybackContext);
    if (!context) {
        throw new Error(
            "useAudioPlayback must be used inside AudioPlaybackProvider"
        );
    }
    return context;
}
