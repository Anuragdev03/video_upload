import { useEffect, useState } from "react"
import VideoPlayer from "./VideoPlayer";
import Modal from "./Modal";

interface Data {
    fileName: string;
    size: number;
    url: string
}

export default function VideoList() {
    const [videoList, setVideoList] = useState<Data[]>([]);
    const [count, setCount] = useState(0);
    const [src, setSrc] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchVideos();
    }, [])

    async function fetchVideos() {
        let res = await fetch("http://localhost:8000/videos");
        let data = await res.json();
        setCount(data.total)
        setVideoList(data.videos)
        console.log(data)
    }

    function getSize(val:number) {
        const size = val / (1024*1024)
        return size.toFixed(2);
    }

    function handleModal() {
        setIsOpen(!isOpen)
    }

    function handlePlay(fileName: string) {
        const url = `http://localhost:8000/videos/${fileName}`;
        setSrc(url);
        setIsOpen(!isOpen)
    }
    return (
        <div>
            <h5>Video Count: {count}</h5>

            {Array.isArray(videoList) && videoList.length ? <>
                {videoList.map(obj => (
                    <div className="video_card">
                        <h6>{obj?.fileName}</h6>
                        <h6>{getSize(obj.size)} MB</h6>
                        <button className="upload_btn" onClick={() => handlePlay(obj.fileName)}>Play</button>
                    </div>
                ))}
            </> : <h5>No videos found!</h5>}

            <Modal
                isOpen={isOpen}
                closeModal={handleModal}
            >
                <VideoPlayer src={src} />
            </Modal>

        </div>
    )
}