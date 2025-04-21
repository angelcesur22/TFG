const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verificarSesion, isAdmin } = require('../middleware/authMiddleware');
 // ✅ Asegúrate de usar tu middleware correctamente

// Listar usuarios
router.get('/admin/usuarios', isAdmin, userController.listarUsuarios);


// Mostrar formulario de edición de un usuario
router.get('/admin/usuarios/editar/:id', isAdmin, userController.mostrarEditarUsuario);

// Procesar la edición de un usuario
router.post('/admin/usuarios/editar/:id', isAdmin, userController.editarUsuario);

// Eliminar un usuario
router.post('/admin/usuarios/eliminar/:id', isAdmin, userController.eliminarUsuario);
router.get('/admin/usuarios/:id/pedidos', isAdmin, userController.verPedidosDeUsuario);

module.exports = router;