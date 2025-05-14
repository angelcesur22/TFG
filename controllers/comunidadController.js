// controllers/comunidadController.js
const ProductoComunidad = require('../models/ProductoComunidad');
const nodemailer = require('nodemailer');

exports.enviarSolicitudVenta = async (req, res) => {
  try {
    const { nombre, marca, talla, descripcion, precio, estado } = req.body;

    if (!req.files || req.files.length < 3) {
      return res.status(400).send("Debes subir al menos 3 imágenes.");
    }

    const imagenes = req.files.map(file => '/uploads/' + file.filename);

    const producto = new ProductoComunidad({
      usuario: req.user._id,
      nombre,
      marca,
      talla,
      descripcion,
      precio,
      estado,
      imagenes
    });

    await producto.save();

    // Enviar correo de confirmación con resumen
    await enviarCorreoConfirmacion(req.user.email, producto);

    res.redirect('/perfil?success=Producto enviado correctamente');
  } catch (error) {
    console.error('❌ Error al procesar solicitud de venta:', error);
    res.status(500).send('Error al procesar la solicitud de venta.');
  }
};

async function enviarCorreoConfirmacion(destinatario, producto) {
  const comision = producto.precio * 0.10;
  const envio = 15;
  const precioFinal = producto.precio - comision - envio;
  const precioPublico = producto.precio + comision;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

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
}
