const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // Cambié la importación

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Configuración de Multer para Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'productos', // O la carpeta que desees
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'], // Formatos permitidos
  },
});

// Inicialización de Multer con Cloudinary Storage
const upload = multer({ storage: storage });

module.exports = upload;
