import React, { useState, useRef } from "react";
import "./VideoPlayer.css";

interface Props {
    src: string;
}

export default function VideoPlayer(props: Props) {
    const videoRef = useRef<any>(null)
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    // Format time
    function formatTime(time: number) {
        // const minutes = Math.floor(time / 60);
        // const seconds = Math.floor(time / 60);
        // return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        return time.toFixed(2)
    }

    function handleProgressChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = Number(e.target.value)
        const newTimeLine = (value / 100) * videoRef.current.duration;
        videoRef.current.currentTime = newTimeLine
        setProgress(value)
    }

    function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newVolume = e.target.value;
        videoRef.current.volume = newVolume
        setVolume(+newVolume)
    }

    function handleFullscreen() {
        if (videoRef.current.requestFullscreen) {
            videoRef.current.requestFullscreen()
        } else if (videoRef.current.webkitRequestFullscreen) {
            videoRef.current.webkitRequestFullscreen()
        }
    }

    function handleTimeUpdate() {
        const current = videoRef.current.currentTime;
        const duration = videoRef.current.duration;
        console.log(current, "abcd", duration)
        setCurrentTime(current);
        setProgress((current / duration) * 100);
    }

    const togglePlayPause = () => {
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleLoadedMetadata = () => {
        setDuration(videoRef.current.duration);
    };
    console.log(videoRef)

    return (
        <div className="video-player">
            <video
                ref={videoRef}
                src={props.src}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={togglePlayPause}
            />
            <div className="controls">
                <button onClick={togglePlayPause}>
                    {isPlaying ? "Pause" : "Play"}
                </button>
                <span>{formatTime(currentTime)} / {formatTime(duration)}</span>

                <input
                    type="range"
                    value={progress}
                    onChange={handleProgressChange}
                    max={100}
                    className="progress-bar"
                />

                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="volume-control"
                />

                <button onClick={handleFullscreen}>Fullscreen</button>
            </div>
        </div>
    )
}