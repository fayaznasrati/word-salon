import multer from "multer";
import path from "path";
import fs from "fs";

// 1. Define and ensure the upload directory exists
const uploadDir = path.join(process.cwd(), "uploads/profile-photos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
     const filename = `user-${req.user.id}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

export const uploadPhoto = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG/PNG/GIF allowed."), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("photo");