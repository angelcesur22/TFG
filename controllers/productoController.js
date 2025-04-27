const path = require('path');
const Producto = require('../models/Producto');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');


// Configura Cloudinary correctamente
cloudinary.config({
    cloud_name: 'TU_CLOUD_NAME',
    api_key: 'TU_API_KEY',
    api_secret: 'TU_API_SECRET'
});

const crearProducto = async (req, res) => {
    try {
      const { nombre, marca, tipo, descripcion, categoria, etiqueta } = req.body;
  
      const tallas = req.body.tallas.map(t => ({
        talla: t.talla,
        precio: t.precio,
        stock: t.stock
      }));
  
      // Subir múltiples imágenes a Cloudinary
      const resultados = await Promise.all(
        req.files.map(file => cloudinary.uploader.upload(file.path))
      );
  
      const imagenes = resultados.map(r => r.secure_url);
  
      const nuevoProducto = new Producto({
        nombre,
        marca,
        tipo,
        descripcion,
        categoria,
        etiqueta,
        imagenes,
        tallas
      });
  
      await nuevoProducto.save();
      res.redirect('/admin/productos');
    } catch (error) {
      console.error('Error al crear producto:', error.message);
      res.status(500).send('Error al crear el producto');
    }
  };

const editarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, marca, tipo, descripcion, categoria, tallas, rebaja, precioAnterior } = req.body;
    let nuevaImagen = null;

    if (req.file) {
        nuevaImagen = req.file.path; // Si usas Cloudinary, debes procesar esta imagen antes de guardarla
    }

    try {
        const producto = await Producto.findById(id);

        if (!producto) {
            return res.status(404).send('Producto no encontrado');
        }

        // Asignamos los valores del producto
        producto.nombre = nombre || producto.nombre;
        producto.marca = marca || producto.marca;
        producto.tipo = tipo || producto.tipo;
        producto.descripcion = descripcion || producto.descripcion;
        producto.categoria = categoria || producto.categoria; // Aquí se actualiza la categoría

        // Procesar las tallas
        if (tallas && Array.isArray(tallas)) {
            producto.tallas = tallas.map(talla => ({
                talla: talla.talla,
                precio: talla.precio,
                stock: talla.stock,
            }));
        }

        // Si se sube una nueva imagen, la guardamos
        if (nuevaImagen) {
            producto.imagen = nuevaImagen;
        }

        producto.rebaja = rebaja === 'on';
        if (producto.rebaja) {
          producto.precioAnterior = precioAnterior;
        } else {
          producto.precioAnterior = 0;
        }
    
        await producto.save();
        res.redirect('/admin/productos?mensaje=editado');
      } catch (err) {
        console.error('Error al editar producto:', err);
        res.redirect('/admin/productos?mensaje=error');
      }
    };
    


const buscarProductos = async (req, res) => {
  const { buscar, tipo, precioMin, precioMax, talla, pagina } = req.query;

  // Configuración de la página
  const productosPorPagina = 10;
  const paginaActual = parseInt(pagina) || 1;
  const skip = (paginaActual - 1) * productosPorPagina;

  // Construir el filtro de búsqueda
  let filtro = {};

  if (buscar) {
      filtro.$or = [
          { nombre: { $regex: buscar, $options: 'i' } },
          { marca: { $regex: buscar, $options: 'i' } }
      ];
  }
  
  if (tipo) {
      filtro.tipo = tipo;
  }

  if (precioMin || precioMax) {
      filtro['tallas.precio'] = {};
      if (precioMin) filtro['tallas.precio'].$gte = parseFloat(precioMin);
      if (precioMax) filtro['tallas.precio'].$lte = parseFloat(precioMax);
  }

  if (talla) {
      filtro['tallas.talla'] = parseInt(talla); // 🔥 Este es el cambio importante
  }

  try {
      // Obtener productos filtrados y con paginación
      const productos = await Producto.find(filtro)
          .skip(skip)
          .limit(productosPorPagina);

      const totalProductos = await Producto.countDocuments(filtro);

      // Renderizar la vista con los productos
      res.render('tablaProductos', {
          productos,
          totalProductos,
          paginaActual,
          productosPorPagina
      });
  } catch (err) {
      console.error('Error al buscar productos:', err);
      res.status(500).send('Error al buscar productos');
  }
};

const filtrarSneakers = async (req, res) => {
  try {
    const { talla, min, max, marca, etiqueta, orden, search } = req.query;
    const filtro = { categoria: "zapatillas" };


    if (talla && talla !== "") {
      filtro["tallas.talla"] = talla;
    }

    if (min) {
      filtro["tallas.precio"] = {
        ...(filtro["tallas.precio"] || {}),
        $gte: Number(min),
      };
    }

    if (max) {
      filtro["tallas.precio"] = {
        ...(filtro["tallas.precio"] || {}),
        $lte: Number(max),
      };
    }

    if (marca && marca.trim() !== "") {
      filtro.marca = new RegExp(marca.trim(), "i");
    }

    if (etiqueta && etiqueta !== "") {
      filtro.etiqueta = etiqueta;
    }

    let ordenamiento = {};
    if (orden === "asc") ordenamiento["tallas.precio"] = 1;
    if (orden === "desc") ordenamiento["tallas.precio"] = -1;

    const productos = await Producto.find(filtro).sort(ordenamiento);

    res.render("sneakers", {
      productos,
      talla,
      min,
      max,
      marca,
      etiqueta,
      orden,
      search,
      user: req.user || null
    });
    
  } catch (error) {
    console.error("Error al filtrar sneakers:", error);
    res.status(500).send("Error del servidor");
  }
};


const buscarProductosLive = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        const productos = await Producto.find({
            nombre: { $regex: query, $options: "i" }
        }).limit(10).select("nombre _id");

        res.json(productos);
    } catch (error) {
        console.error("Error en búsqueda en vivo:", error);
        res.status(500).json([]);
    }
};
const mostrarInicio = async (req, res) => {
  try {
    const nuevos = await Producto.find().sort({ fechaCreacion: -1 }).limit(8);
    const masVendidos = await Producto.find({ etiqueta: 'bestseller' }).limit(8);
    const productosEnOferta = await Producto.find({ precioAnterior: { $gt: 0 } }).limit(8);

    res.render('index', {
      productos: nuevos,
      bestSellers: masVendidos,
      ofertas: productosEnOferta,
      user: req.user || null
    });
  } catch (error) {
    console.error('Error al mostrar inicio:', error);
    res.status(500).send('Error al cargar la página principal');
  }
};

  module.exports = {
    crearProducto,
    editarProducto,
    buscarProductos,
    filtrarSneakers,
    buscarProductosLive,
    mostrarInicio
  };
