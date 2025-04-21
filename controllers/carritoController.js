const User = require('../models/User');
const Producto = require('../models/Producto');

exports.agregarProducto = async (req, res) => {
  const userId = req.session.user?._id;
  const { productoId, talla } = req.body;

  if (!userId) {
    return res.status(401).send('Usuario no autenticado');
  }

  if (!productoId || !talla) {
    return res.status(400).send('Datos incompletos');
  }

  try {
    const producto = await Producto.findById(productoId);
    if (!producto) {
      return res.status(404).send('Producto no encontrado');
    }

    const tallaSeleccionada = producto.tallas.find(t => t.talla === talla);
    if (!tallaSeleccionada) {
      return res.status(400).send('Talla no válida');
    }

    const user = await User.findById(userId);
    user.carrito.push({
      producto: productoId,
      talla: talla,
      precio: tallaSeleccionada.precio
    });

    await user.save();
    res.redirect('/carrito');
  } catch (error) {
    console.error("Error al agregar al carrito:", error);
    res.status(500).send('Error al agregar al carrito');
  }
};

exports.mostrarCarrito = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).populate('carrito.producto');

    const carrito = user.carrito.map(item => ({
      ...item.toObject(), // Esto incluye el _id del item del carrito
      producto: item.producto ? {
        _id: item.producto._id, // 👈 aseguramos que venga el ID
        nombre: item.producto.nombre,
        marca: item.producto.marca,
        imagen: item.producto.imagenes[0],
        precio: item.producto.tallas.find(t => t.talla === item.talla)?.precio || 0
      } : null
    }));

    const total = carrito.reduce((sum, item) => sum + (item.producto?.precio || 0) * item.cantidad, 0);

    const mensaje = req.session.mensaje;
    delete req.session.mensaje;

    res.render('carrito', { carrito, total, user: req.session.user, mensaje });
  } catch (error) {
    console.error('Error al mostrar el carrito:', error);
    res.status(500).send('Error al cargar el carrito');
  }
};


exports.eliminarProducto = async (req, res) => {
  const userId = req.session.user?._id;
  const { id } = req.params;

  try {
    const user = await User.findById(userId);0
     // Aquí van los logs 👇
     console.log("🗑 Intentando eliminar item con ID:", id);
     console.log("🎯 Carrito antes:", user.carrito.map(i => i._id.toString()));
 

    // Este filtro debe eliminar por el _id del ítem del carrito
    user.carrito = user.carrito.filter(item => String(item._id) !== String(id));
    await user.save();
    console.log("✅ Carrito después:", user.carrito.map(i => i._id.toString()));
    req.session.mensaje = '✅ Producto eliminado del carrito';


    res.redirect('/carrito');
  } catch (error) {
    console.error("Error al eliminar del carrito:", error);
    res.status(500).send('Error al eliminar del carrito');
  }
};