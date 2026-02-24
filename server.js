const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = Number(process.env.PORT || 8080);

const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, "data");
const DATA_FILE = path.join(DATA_DIR, "uploads.json");
const UPLOADS_DIR = path.join(ROOT_DIR, "uploads");
const IMAGES_DIR = path.join(ROOT_DIR, "images");
const IMAGE_UPLOADS_DIR = path.join(IMAGES_DIR, "uploads");
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const ALLOWED_CATEGORIES = new Set([
  "dining",
  "decks",
  "activities",
  "ports",
  "heroes",
  "staterooms",
]);

function sanitizeText(value, fallback = "") {
  const normalized = String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
  return normalized || fallback;
}

function safeCategory(value) {
  const normalized = String(value || "")
    .toLowerCase()
    .trim();
  return ALLOWED_CATEGORIES.has(normalized) ? normalized : "activities";
}

async function ensureStorage() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(IMAGES_DIR, { recursive: true });
  await fs.mkdir(IMAGE_UPLOADS_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]\n", "utf8");
  }
}

async function readPhotoRecords() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writePhotoRecords(records) {
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(records, null, 2) + "\n",
    "utf8",
  );
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, IMAGE_UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const stamp = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 8);
    cb(null, `${stamp}-${rand}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    if (String(file.mimetype || "").startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Only image files are supported."));
  },
});

app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));
app.use(express.static(ROOT_DIR));

app.get("/api/photos", async (_req, res) => {
  const records = await readPhotoRecords();
  res.json({
    ok: true,
    photos: records,
  });
});

app.post("/api/photos/upload", upload.single("photo"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ ok: false, message: "Photo file is required." });
    return;
  }

  const title = sanitizeText(req.body.title, "Guest photo");
  const description = sanitizeText(req.body.description, "Uploaded photo.");
  const category = safeCategory(req.body.category);
  const deck = sanitizeText(req.body.deck, "");
  const tagRaw = sanitizeText(req.body.tags, "");
  const tags = tagRaw
    ? tagRaw
        .split(",")
        .map((entry) => sanitizeText(entry, ""))
        .filter(Boolean)
        .slice(0, 12)
    : ["uploaded"];

  const photo = {
    id: Date.now(),
    title,
    src: `/images/uploads/${req.file.filename}`,
    category,
    deck,
    source: "user",
    description,
    tags,
    uploadedAt: new Date().toISOString(),
  };

  const records = await readPhotoRecords();
  records.unshift(photo);
  await writePhotoRecords(records);

  res.status(201).json({
    ok: true,
    photo,
  });
});

app.use((error, _req, res, _next) => {
  const message =
    error && error.message
      ? error.message
      : "Unexpected server error while handling upload.";
  const status = message.includes("File too large") ? 413 : 400;
  res.status(status).json({ ok: false, message });
});

ensureStorage()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Cruise app server listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize upload storage:", error);
    process.exit(1);
  });
