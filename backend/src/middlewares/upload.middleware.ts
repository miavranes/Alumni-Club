// src/middlewares/upload.middleware.ts
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsRoot = path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(uploadsRoot, "avatars");
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    const userId = req.user?.id ?? "anon";
    cb(null, `${userId}_${Date.now()}_${base}${ext}`);
  },
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
}).single("avatar");

const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(uploadsRoot, "cv");
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    const userId = req.user?.id ?? "anon";
    cb(null, `${userId}_${Date.now()}_${base}${ext}`);
  },
});

export const uploadCv = multer({
  storage: cvStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed for CV"));
    }
    cb(null, true);
  },
}).single("cv");

const thesisStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(uploadsRoot, "theses");
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    const userId = req.user?.id ?? "anon";
    cb(null, `${userId}_${Date.now()}_${base}${ext}`);
  },
});

export const uploadThesis = multer({
  storage: thesisStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Dozvoljeni su samo PDF fajlovi"));
    }
    cb(null, true);
  },
}).single("file");
