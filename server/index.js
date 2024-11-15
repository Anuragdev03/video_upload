// Import the Express module
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const fileReader = require("fs/promises")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = './uploads';
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});


function  fileFilter(req, file, cb) {
    // Add your allowed mime types
    const allowedMimes = ['video/mp4', 'video/mpeg', 'video/quicktime', "video/webm"];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only video files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB limit
        files: 1 // Maximum 1 file
    }
});


// Initialize an Express application
const app = express();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Define a port to run the server
const PORT = 8000;

const validateContentType = (req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
        return res.status(400).json({
            error: 'Invalid content type. Must be multipart/form-data'
        });
    }
    next();
};


// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get("/videos", async (req, res) => {
    try {
        const uploadDir = path.join(__dirname, "uploads")
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const files =  await fileReader.readdir(uploadDir);

        const videos = files.map(file => {
            const stats = fs.statSync(path.join(uploadDir,file))
            return {
                fileName: file,
                size: stats.size,
                url: `/uploads/${file}`
            }
        })
        const data = {
            total: videos.length,
            videos: videos
        }
        res.send(data)
    } catch(err) {
        console.log(err)
        res.send("Somthing went wrong pls try again")
    }
})

app.get("/videos/:fileName", (req,res) => {
    const fileName = req.params.fileName;
    const videoPath = path.join(__dirname, 'uploads', fileName);
    if (!fs.existsSync(videoPath)) {
        return res.status(404).send('Video not found');
    }
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    if(range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[0], 10) : fileSize - 1;
        const chunkSize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, {start, end});

        const head = {
            'Content-Length': chunkSize,
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': "bytes",
            'Content-Type': 'video/mp4',
        }
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head)
        fs.createReadStream(videoPath).pipe(res)
    }

})

// Another route example
app.post('/upload', validateContentType, (req, res) => {
    req.setTimeout(3600000); 
    upload.single('video')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Multer-specific errors
            switch (err.code) {
                case 'LIMIT_FILE_SIZE':
                    return res.status(400).json({
                        error: 'File size too large. Maximum size is 100MB'
                    });
                case 'LIMIT_FILE_COUNT':
                    return res.status(400).json({
                        error: 'Too many files. Maximum is 1 file'
                    });
                case 'LIMIT_UNEXPECTED_FILE':
                    return res.status(400).json({
                        error: 'Unexpected field name'
                    });
                default:
                    return res.status(400).json({
                        error: 'Error uploading file: ' + err.message
                    });
            }
        } else if (err) {
            // Other errors (including your custom fileFilter errors)
            return res.status(400).json({
                error: err.message
            });
        }
        console.log(req.baseUrl)
        // If no file was provided
        if (!req.file) {
            return res.status(400).json({
                error: 'Please provide a file'
            });
        }
        // Success case
        res.status(200).json({
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    });
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:8000`);
});
