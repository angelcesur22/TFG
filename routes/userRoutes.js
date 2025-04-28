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

router.get('/perfil/wishlist', async (req, res) => {
    try {
      const User = require('../models/User');
      const Producto = require('../models/Producto');
  
      const user = await User.findById(req.user._id).populate('wishlist');
      const wishlist = user.wishlist;
  
      res.render('wishlistPerfil', {
        user,
        wishlist
      });
    } catch (err) {
      console.error("❌ Error al cargar la wishlist:", err);
      res.status(500).send("Error al mostrar la lista de deseos.");
    }
  });

module.exports = router;