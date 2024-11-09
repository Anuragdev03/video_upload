import { useState } from 'react'

import './App.css'

function App() {
  const [uploadVideos, setUploadVideos] = useState(false);
  const [seeVideos, setSeeVideos] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  function handleUploadVideos() {
    setUploadVideos(true)
    setSeeVideos(false)
  }

  function handleSeeVideos() {
    setSeeVideos(true)
    setUploadVideos(false)
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;
    console.log(event.target.files)
    setFile(event.target.files[0])
  }


  function UploadVideos() {
    return (
      <div className='upload_videos'>
        <input type='file' onChange={handleChange} />
        <p className='file_name'>{file?.name}</p>
        <button className='upload_btn' onClick={handleUpload}>Upload</button>
      </div>
    )
  }

  async function handleUpload() {
    if (!file) return
    const formData = new FormData();
    formData.append('video', file);

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  }


  return (
    <>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <button onClick={handleSeeVideos}>See Videos</button>
        <button onClick={handleUploadVideos}>Upload Videos</button>
      </div>
      {uploadVideos ? <UploadVideos /> : null}
    </>
  )
}

export default App