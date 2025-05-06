// routes/webhookRoutes.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
const User = require('../models/User');
const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const transporter = require('../config/mailConfig');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/stripe', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  console.log('📩 Webhook recibido:', sig);

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Error al verificar la firma:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email;

    try {
      const user = await User.findOne({ email }).populate('carrito.producto');

      if (!user || user.carrito.length === 0) {
        console.log('Carrito vacío o usuario no encontrado.');
        return res.sendStatus(200);
      }

      const productosPedido = await Promise.all(user.carrito.map(async item => {
        const productoCompleto = await Producto.findById(item.producto._id).select('nombre marca imagenes tallas');

        return {
          producto: {
            _id: productoCompleto._id,
            nombre: productoCompleto.nombre,
            marca: productoCompleto.marca,
            foto: productoCompleto.imagenes?.[0] || '/images/default.jpg'
          },
          cantidad: item.cantidad,
          talla: item.talla,
          precio: productoCompleto.tallas.find(t => t.talla === item.talla)?.precio || productoCompleto.precio || 0
        };
      }));

      const fechaFormateada = new Date().toLocaleString('es-ES', {
        timeZone: 'Europe/Madrid',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const pedido = new Pedido({
        numeroPedido: generarNumeroPedido(),
        usuario: user._id,
        productos: productosPedido,
        total: productosPedido.reduce((sum, p) => sum + p.precio * p.cantidad, 0),
        fecha: fechaFormateada,
        estado: 'Pendiente'
      });

      await pedido.save();

      user.carrito = [];
      await user.save();

      let resumenPedido = productosPedido.map(p => (
        `- ${p.producto.nombre}\n  Talla: ${p.talla}\n  Cantidad: ${p.cantidad}\n  Precio: ${p.precio}€\n-------------------------`
      )).join('\n');

      await enviarCorreoConfirmacion(user.email, resumenPedido);

      console.log(`✔️ Pedido guardado y correo enviado a ${user.email}`);
      return res.status(200).send('Pedido procesado');
    } catch (error) {
      console.error('Error procesando pedido:', error.message);
      return res.status(500).send('Error');
    }
  }

  res.status(200).send('Evento recibido');
});

function generarNumeroPedido() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `PED-${timestamp}-${random}`;
}

async function enviarCorreoConfirmacion(email, contenido) {
  const mailOptions = {
    from: `"FootLaces" <${process.env.CORREO_USER}>`,
    to: email,
    subject: 'Confirmación de pedido - FootLaces',
    text: `Gracias por tu compra. Detalles del pedido:\n${contenido}`
  };

  await transporter.sendMail(mailOptions);
}

module.exports = router;
