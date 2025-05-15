// routes/comunidadRoutes.js
const express = require('express');
const router = express.Router();
const comunidadController = require('../controllers/comunidadController');
const { verificarSesion } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/comunidad/enviar', verificarSesion, upload.array('imagenes', 5), comunidadController.enviarSolicitudVenta);

module.exports = router;
