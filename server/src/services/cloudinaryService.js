const cloudinary = require('../config/cloudinary');
const AppError = require('../errors/AppError');

// Streams a memory-buffered multer file straight to Cloudinary - never
// written to local disk (Render's filesystem is ephemeral).
function uploadBuffer(file, folder) {
  return new Promise((resolve, reject) => {
    const resourceType = file.mimetype.startsWith('video') ? 'video' : 'image';
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(AppError.badRequest(`Upload failed: ${error.message}`, 'UPLOAD_FAILED'));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType,
        });
      },
    );
    stream.end(file.buffer);
  });
}

async function uploadMany(files = [], folder) {
  return Promise.all(files.map((file) => uploadBuffer(file, folder)));
}

module.exports = { uploadBuffer, uploadMany };
