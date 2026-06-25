const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../', process.env.UPLOAD_DIR || 'uploads');

const getFullUrl = (req, filename) => {
  const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${filename}`;
};
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
});

const optimizeImage = async (req, res, next) => {
  if (!req.file) return next();

  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
  const outputPath = path.join(uploadDir, filename);

  try {
    await sharp(req.file.buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    req.file.filename = filename;
    req.file.path = outputPath;
    req.fileUrl = getFullUrl(req, filename);
  } catch (err) {
    console.error('Image optimization error:', err);
    const fallbackFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(req.file.originalname)}`;
    fs.writeFileSync(path.join(uploadDir, fallbackFilename), req.file.buffer);
    req.file.filename = fallbackFilename;
    req.fileUrl = getFullUrl(req, fallbackFilename);
  }

  next();
};

const uploadMultiple = (fieldName, maxCount = 10) => upload.array(fieldName, maxCount);

const uploadSingle = [upload.single('image'), optimizeImage];
const uploadMultipleMiddleware = [upload.array('images', 10), (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();
  let completed = 0;
  req.files.forEach((file, index) => {
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${index}.webp`;
    const outputPath = path.join(uploadDir, filename);
    sharp(file.buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath)
      .then(() => {
        file.filename = filename;
        completed++;
        if (completed === req.files.length) next();
      })
      .catch(() => {
        const fallbackFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${index}${path.extname(file.originalname)}`;
        fs.writeFileSync(path.join(uploadDir, fallbackFilename), file.buffer);
        file.filename = fallbackFilename;
        completed++;
        if (completed === req.files.length) next();
      });
  });
}];

module.exports = { upload, optimizeImage, uploadMultiple: uploadMultipleMiddleware, uploadSingle };
