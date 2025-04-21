const express = require('express');
const router = express.Router();
const { crearProducto, editarProducto, buscarProductos } = require('../controllers/productoController'); 
const Producto = require('../models/Producto');
const upload = require('../config/upload');





router.get('/crear', (req, res) => {
  res.render('crearProducto', { error: null });
});

router.post('/crear', upload.array('imagenes', 5), crearProducto);


router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find().sort({ fechaCreacion: -1 });
    res.render('listaProductos', { productos });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cargar productos');
  }
});

router.post('/eliminar/:id', async (req, res) => {
  try {
    await Producto.findByIdAndDelete(req.params.id);
    res.redirect('/admin/productos');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar producto');
  }
});

// Mostrar formulario para editar producto
router.get('/editar/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.send('Producto no encontrado');
    res.render('editarProducto', { producto });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cargar producto');
  }
});

// Ruta para editar producto
router.post('/editar/:id', upload.single('imagen'), editarProducto);

router.get('/api', buscarProductos);

// Ruta para listar productos (con búsqueda)
router.get('/api', async (req, res) => {
  try {
    const { buscar, tipo, precioMin, precioMax, pagina = 1 } = req.query;
    const productosPorPagina = 5;
    const filtro = {};

    if (buscar) {
      filtro.$or = [
        { nombre: new RegExp(buscar, 'i') },
        { marca: new RegExp(buscar, 'i') }
      ];
    }

    if (tipo && tipo !== '') filtro.tipo = tipo;

    if (precioMin || precioMax) {
      filtro.tallas = { $elemMatch: {} };
      if (precioMin) filtro.tallas.$elemMatch.precio = { $gte: Number(precioMin) };
      if (precioMax) filtro.tallas.$elemMatch.precio = { ...filtro.tallas.$elemMatch.precio, $lte: Number(precioMax) };
    }

    const totalProductos = await Producto.countDocuments(filtro);
    const productos = await Producto.find(filtro)
      .sort({ fechaCreacion: -1 })
      .skip((pagina - 1) * productosPorPagina)
      .limit(productosPorPagina);

    res.render('tablaProductos', { productos, totalProductos, productosPorPagina, paginaActual: Number(pagina) }, (err, html) => {
      if (err) return res.status(500).send('Error al renderizar productos');
      res.send(html);
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cargar productos');
  }
});

module.exports = router;
