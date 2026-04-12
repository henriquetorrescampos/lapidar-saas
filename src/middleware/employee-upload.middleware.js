import fs from "node:fs";
import path from "node:path";
import multer from "multer";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "employees");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Only PDF and image files (PNG/JPG) are allowed"));
  }

  cb(null, true);
};

export const employeeUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
