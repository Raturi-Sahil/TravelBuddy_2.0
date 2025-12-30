// components/chat/AudioMessage.jsx
import { useEffect, useRef, useState } from "react";
import { Play, Pause, Mic, User } from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import { useAudioPlayback } from "../../context/AudioPlaybackContext";

function formatTime(seconds = 0) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioMessage({ src, isOwn, senderProfileImage }) {
    const containerRef = useRef(null);
    const waveSurferRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const { activeAudioRef } = useAudioPlayback();

    useEffect(() => {
        if (!containerRef.current) return;

        const ws = WaveSurfer.create({
            container: containerRef.current,
            waveColor: isOwn ? "#ffd8b1" : "#4b5563",
            progressColor: isOwn ? "#ffffff" : "#f97316",
            cursorColor: "transparent",
            barWidth: 2,
            barGap: 3,
            barRadius: 3,
            height: 36,
            normalize: true,
            url: src,
        });

        waveSurferRef.current = ws;

        ws.on("play", () => setIsPlaying(true));
        ws.on("pause", () => setIsPlaying(false));
        ws.on("timeupdate", (time) => setCurrentTime(time));
        ws.on("ready", (dur) => setDuration(dur));
        ws.on("finish", () => {
            setIsPlaying(false);
            if (activeAudioRef.current === ws) {
                activeAudioRef.current = null;
            }
        });

        return () => {
            ws.destroy();
        };
    }, [src, isOwn, activeAudioRef]);

    // Global pause synchronization
    useEffect(() => {
        const ws = waveSurferRef.current;
        if (!ws) return;

        const interval = setInterval(() => {
            if (activeAudioRef.current && activeAudioRef.current !== ws && isPlaying) {
                ws.pause();
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isPlaying, activeAudioRef]);

    const togglePlay = () => {
        const ws = waveSurferRef.current;
        if (!ws) return;

        if (isPlaying) {
            ws.pause();
        } else {
            if (activeAudioRef.current && activeAudioRef.current !== ws) {
                if (typeof activeAudioRef.current.pause === 'function') {
                    activeAudioRef.current.pause();
                }
            }
            ws.play();
            activeAudioRef.current = ws;
        }
    };

    return (
        <div className={`flex items-center gap-3 py-1 w-[284px] sm:w-[320px] max-w-full`}>
            {/* WhatsApp Style Avatar with Mic Overlay */}
            <div className="relative shrink-0">
                <div className={`w-11 h-11 rounded-full overflow-hidden border-2 
          ${isOwn ? "border-orange-400" : "border-gray-600 bg-gray-700"}`}>
                    {senderProfileImage ? (
                        <img src={senderProfileImage} alt="Sender" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <User size={20} />
                        </div>
                    )}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 
          ${isOwn ? "bg-orange-600 border-orange-500" : "bg-gray-800 border-gray-700 text-orange-500"}`}>
                    <Mic size={10} className={isOwn ? "text-white" : "text-orange-500"} />
                </div>
            </div>

            {/* Play/Pause Button */}
            <button
                onClick={togglePlay}
                className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-transform active:scale-95
          ${isOwn ? "text-white hover:text-orange-200" : "text-gray-300 hover:text-white"}`}
            >
                {isPlaying ? (
                    <Pause size={24} fill="currentColor" />
                ) : (
                    <Play size={24} className="ml-0.5" fill="currentColor" />
                )}
            </button>

            {/* Waveform and Time Info */}
            <div className="flex-1 flex flex-col min-w-0">
                <div ref={containerRef} className="w-full h-[36px]" />
                <div className="flex justify-between items-center mt-[-2px]">
                    <span className={`text-[10px] font-medium ${isOwn ? "text-orange-100/90" : "text-gray-400"}`}>
                        {formatTime(currentTime)}
                    </span>
                    <span className={`text-[10px] font-medium ${isOwn ? "text-orange-100/90" : "text-gray-400"} ${duration > 0 ? 'opacity-100' : 'opacity-0'}`}>
                        {formatTime(duration)}
                    </span>
                </div>
            </div>
        </div>
    );
}
