// webRoutes.js

const express = require('express');
const router = express.Router();
const { login, registerUser } = require('../controllers/authController');
const Producto = require('../models/Producto'); 
const Pedido = require('../models/Pedido');
const pedidoController = require('../controllers/pedidoController');
const { verificarSesion } = require('../middleware/authMiddleware');
const carritoController = require('../controllers/carritoController');
const stripeController = require('../controllers/stripe');
const productoController = require('../controllers/productoController');
const userController = require('../controllers/userController');
const { verRopa } = require('../controllers/productoController');
const { verOfertas } = require('../controllers/productoController');
const { devolverPedido } = require('../controllers/pedidoController');
const adminController = require('../controllers/adminController');
const User = require('../models/User');


router.post('/devolver-pedido/:id', devolverPedido);

router.get('/clothing', verRopa);


router.get('/ofertas', verOfertas);

router.get('/admin/devoluciones', adminController.verDevoluciones);
router.post('/admin/devoluciones/aceptar/:id', adminController.aceptarDevolucion);
router.post('/admin/devoluciones/denegar/:id', adminController.denegarDevolucion);








// Función para generar un número de pedido único
const generarNumeroPedido = () => {
    const timestamp = Date.now().toString();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PED-${timestamp}-${randomNum}`;
};
router.get('/sneakers', productoController.filtrarSneakers);
router.get('/buscar', productoController.buscarProductosLive);


// Página principal - Mostrar productos y usuario autenticado
router.get('/', async (req, res) => {
  try {
    const nuevosProductos = await Producto.find().sort({ fechaCreacion: -1 }).limit(8);
    const bestSellers = await Producto.find({ etiqueta: 'bestseller' }).limit(8);
    const productosEnOferta = await Producto.find({ precioAnterior: { $gt: 0 } }).limit(8);

    res.render('index', {
      productos: nuevosProductos,
      bestSellers,
      ofertas: productosEnOferta,
      user: req.session.user || null
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).send('Error al obtener productos.');
  }
});
router.get('/producto/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).render('error', { message: 'Producto no encontrado', error: {} });
    }

    const relacionados = await Producto.find({
      _id: { $ne: producto._id },
      marca: producto.marca
    }).limit(4);

    res.render('producto', {
      producto,
      relacionados,
      user: req.session.user || null
    });
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).send('Error al obtener el producto');
  }
});
// Ruta para realizar un pedido
router.post('/pedido', async (req, res) => {
  if (!req.session.user) {
      return res.redirect('/login');
  }

  const { productoId, cantidad } = req.body;

  try {
      const producto = await Producto.findById(productoId);

      if (!producto) {
          return res.status(404).send('Producto no encontrado.');
      }

      const nuevoPedido = new Pedido({
          numeroPedido: generarNumeroPedido(), // ✅ Generar número de pedido único
          usuario: req.session.user.id,
          producto: producto._id,
          cantidad: parseInt(cantidad)
      });

      await nuevoPedido.save();

      res.send('Pedido realizado con éxito.');
  } catch (error) {
      console.error('Error al realizar el pedido:', error);
      res.status(500).send('Error al realizar el pedido.');
  }
});

// Ruta para manejar el login
router.post('/login', login);

// Página de login
router.get('/login', (req, res) => {
  res.render('login');
});

// Página de registro
router.get('/registro', (req, res) => {
  res.render('registro');
});

router.post('/register', registerUser);


router.get('/actualizar-fechas', async (req, res) => {
    try {
      const result = await Producto.updateMany(
        { fechaCreacion: { $exists: false } },
        { $set: { fechaCreacion: new Date() } }
      );
      res.send(`Productos actualizados: ${result.modifiedCount}`);
    } catch (error) {
      console.error('Error actualizando fechas:', error);
      res.status(500).send('Error al actualizar fechas.');
    }
  });
  // Ver carrito
router.get('/carrito', verificarSesion, carritoController.mostrarCarrito);

// Añadir al carrito
router.post('/carrito/agregar', verificarSesion, carritoController.agregarProducto);
router.post('/carrito/eliminar/:id', verificarSesion, carritoController.eliminarProducto);


router.get('/pagar', verificarSesion, stripeController.checkout);

router.post('/cancelar-pedido/:id', pedidoController.cancelarPedido);


router.get('/pedido/confirmado', (req, res) => {
  res.render('confirmacion', {
    user: req.session.user,
    mensaje: '✅ ¡Gracias por tu compra! Revisa tu correo para más detalles.'
  });
});
router.get('/perfil/anadir-direccion', (req, res) => {
  res.redirect('/perfil');
});

router.get('/perfil', verificarSesion, userController.verPerfil);
router.post('/perfil/editar', verificarSesion, userController.actualizarPerfil);

router.get('/confirmar-devolucion/:id', async (req, res) => {
  const { id } = req.params;
  res.render('confirmarDevolucion', {
    pedidoId: id,
    user: req.session.user || null
  });
  
});

router.post('/confirmar-devolucion/:id', pedidoController.confirmarDevolucion);
router.get('/wishlist', verificarSesion, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).populate('wishlist');
    res.render('wishlist', { productos: user.wishlist, user: req.session.user });
  } catch (error) {
    console.error('Error al cargar wishlist:', error);
    res.status(500).send('Error al cargar la lista de deseos');
  }
});
router.get('/perfil/anadir-direccion', (req, res) => {
  res.redirect('/perfil');
});


module.exports = router;


