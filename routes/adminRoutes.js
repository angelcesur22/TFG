const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const pedidoController = require('../controllers/pedidoController');
const userController = require('../controllers/userController');
const { isAdmin } = require('../middleware/authMiddleware');




// Rutas protegidas con el middleware isAdmin
router.get('/', isAdmin, adminController.panel);
router.get('/pedidos', isAdmin, pedidoController.listarPedidos);
router.get('/usuarios', isAdmin, userController.listarUsuarios);

router.post('/pedidos/actualizar/:id', isAdmin, pedidoController.actualizarEstado);
router.get('/pedidos/:estado', isAdmin, pedidoController.listarPedidosPorEstado);
router.get('/pedidos/buscar',isAdmin, pedidoController.buscarPedidos);
router.post('/pedidos/eliminar/:id', isAdmin, pedidoController.eliminarPedido);
router.post('/pedidos/guardar-cambios', isAdmin, pedidoController.guardarCambios);
router.get('/admin/devoluciones', adminController.verDevoluciones);
router.post('/admin/devoluciones/aceptar/:id', adminController.aceptarDevolucion);
router.post('/admin/devoluciones/denegar/:id', adminController.denegarDevolucion);
router.get('/comunidad', isAdmin, adminController.verProductosComunidad);
router.post('/comunidad/aprobar/:id', isAdmin, adminController.aprobarProductoComunidad);
router.post('/comunidad/guardar-estados', isAdmin, adminController.actualizarEstadosComunidad);
router.post('/comunidad/rechazar/:id', isAdmin, adminController.rechazarProductoComunidad);
router.post('/comunidad/eliminar/:id', isAdmin, adminController.eliminarProductoComunidad);







module.exports = router;
