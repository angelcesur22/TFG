const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
const User = require('../models/User');
const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const nodemailer = require('nodemailer');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/stripe', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  console.log('📩 Webhook recibido:', sig); // Log para asegurar que llega el webhook

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

      let resumenPedido = '';
      const pedidosGuardados = [];

      for (const item of user.carrito) {
        const pedido = new Pedido({
          numeroPedido: generarNumeroPedido(),
          usuario: user._id,
          producto: item.producto._id,
          cantidad: item.cantidad,
          fecha: new Date(),
          estado: 'Pendiente' // ✅ AÑADIDO para que el pedido tenga estado
        });

        await pedido.save();
        pedidosGuardados.push(pedido);

        resumenPedido += `
        - ${item.producto.nombre}
        Talla: ${item.talla}
        Cantidad: ${item.cantidad}
        Precio: ${item.producto.precio}€
        -------------------------\n`;
      }

      user.carrito = [];
      await user.save();

      await enviarCorreoConfirmacion(user.email, resumenPedido);

      console.log(`✔️ Pedidos guardados y correo enviado a ${user.email}`);
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
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.CORREO_USER,
      pass: process.env.CORREO_PASS
    }
  });

  const mailOptions = {
    from: `"FootLaces" <${process.env.CORREO_USER}>`,
    to: email,
    subject: 'Confirmación de pedido - FootLaces',
    text: `Gracias por tu compra. Detalles del pedido:\n${contenido}`
  };

  await transporter.sendMail(mailOptions);
}

module.exports = router;