// controllers/comunidadController.js
const ProductoComunidad = require('../models/ProductoComunidad');
const transporter = require('../config/mailConfig');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const enviarCorreoConfirmacion = async (destinatario, producto) => {
  const comision = producto.precio * 0.10;
  const envio = 15;
  const precioFinal = producto.precio - comision - envio;
  const precioPublico = producto.precio + comision;

  const mailOptions = {
    from: 'FootLaces <no-reply@footlaces.com>',
    to: destinatario,
    subject: '🧾 Has puesto en venta un artículo',
    html: `
      <p>Has puesto en venta el siguiente producto:</p>
      <ul>
        <li><strong>Nombre:</strong> ${producto.nombre}</li>
        <li><strong>Marca:</strong> ${producto.marca}</li>
        <li><strong>Talla:</strong> ${producto.talla}</li>
        <li><strong>Estado:</strong> ${producto.estado}</li>
        <li><strong>Precio Venta:</strong> ${producto.precio.toFixed(2)}€</li>
        <li><strong>Envío:</strong> -${envio}€</li>
        <li><strong>Comisión FootLaces:</strong> 10%</li>
        <li><strong>Precio final que recibirás:</strong> ${precioFinal.toFixed(2)}€</li>
        <li><strong>Tu producto aparecerá en la web con:</strong> ${precioPublico.toFixed(2)}€</li>
      </ul>
      <p>Recibirás un correo con más información cuando se complete la venta.</p>
      <p>Gracias por usar FootLaces.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

exports.enviarSolicitudVenta = async (req, res) => {
  try {
    console.log('Usuario:', req.user);
    console.log('Archivos recibidos:', req.files);

    if (!req.user || !req.user._id) {
      return res.status(401).send('No has iniciado sesión.');
    }

    const { nombre, marca, talla, descripcion, precio, estado } = req.body;

    if (!req.files || req.files.length < 3) {
      return res.status(400).send("Debes subir al menos 3 imágenes.");
    }

    // Subir imágenes a Cloudinary y eliminar los archivos temporales
    const resultados = await Promise.all(
      req.files.map(async file => {
        const result = await cloudinary.uploader.upload(file.path);
        return result.secure_url;
      })
    );
    

    const producto = new ProductoComunidad({    
      usuario: req.user._id,
      nombre,
      marca,
      talla,
      descripcion,
      precio,
      estado,
      imagenes: resultados
    });

    await producto.save();

    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Error al verificar el transporte:', error);
      } else {
        console.log('✅ Transporter verificado con éxito:', success);
      }
    });

    await enviarCorreoConfirmacion(req.user.email, producto);

    res.render('vender', { user: req.user, success: true });
  } catch (error) {
    console.error('❌ Error al procesar solicitud de venta:');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).send('Error al procesar la solicitud de venta.');
  }
};