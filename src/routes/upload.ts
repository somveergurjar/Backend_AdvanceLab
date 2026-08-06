import { Router } from "express";
import multer from "multer";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { requireAuth } from "../middleware/auth";

export const uploadRouter = Router();

// SVG is deliberately excluded: unlike raster formats, an SVG file can embed
// <script>, making this endpoint a stored-XSS vector since uploads are
// served back out as static files.
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".jfif", ".pjpeg", ".pjp", ".png", ".webp", ".gif", ".bmp"];
const UPLOADS_ROOT = path.join(__dirname, "..", "..", "wwwroot", "uploads");
fs.mkdirSync(UPLOADS_ROOT, { recursive: true });

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10_000_000 } }); // 10 MB

uploadRouter.post("/image", requireAuth, upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file || file.size === 0) {
    return res.status(400).json({ message: "No file provided." });
  }

  const extension = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return res.status(400).json({ message: "Only image files (jpg, jfif, png, webp, gif, bmp, svg) are allowed." });
  }

  const fileName = `${crypto.randomUUID()}${extension}`;
  fs.writeFileSync(path.join(UPLOADS_ROOT, fileName), file.buffer);

  res.json({ url: `/uploads/${fileName}` });
});
