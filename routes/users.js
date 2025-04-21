const express = require('express');
const router = express.Router();

// Controlador (si lo tienes separado)
const userController = require('../controllers/userController'); // Cambia el nombre si tu archivo se llama diferente

// Ruta para mostrar la lista de usuarios
router.get('/', userController.mostrarUsuarios); // o simplemente res.render('listarUsuarios');

// Exporta el router
module.exports = router;
