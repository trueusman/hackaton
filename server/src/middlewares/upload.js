const multer = require('multer');
const AppError = require('../errors/AppError');

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

// Memory storage only - files are streamed straight to Cloudinary and never
// touch disk, since Render's filesystem is ephemeral.
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(AppError.badRequest(`Unsupported file type: ${file.mimetype}`, 'UNSUPPORTED_FILE_TYPE'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 5 },
});

module.exports = upload;
