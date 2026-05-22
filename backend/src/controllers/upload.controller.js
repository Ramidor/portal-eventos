const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_IMAGES = 5;

// Sube un buffer a Cloudinary y devuelve la URL segura
function uploadToCloudinary(buffer, mimetype) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "portal-eventos", resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });
}

// POST /upload  →  Privado (requiere auth)
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No se enviaron imágenes" });
    }
    if (req.files.length > MAX_IMAGES) {
      return res.status(400).json({ error: `Máximo ${MAX_IMAGES} imágenes por subida` });
    }

    const urls = await Promise.all(
      req.files.map((f) => uploadToCloudinary(f.buffer, f.mimetype))
    );

    res.json({ urls });
  } catch (error) {
    console.error("[UPLOAD]", error);
    res.status(500).json({ error: "Error al subir las imágenes" });
  }
};
