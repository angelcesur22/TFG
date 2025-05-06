// controllers/stripe.js
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Producto = require('../models/Producto');

exports.checkout = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).populate('carrito.producto');

    if (!user || user.carrito.length === 0) {
      return res.redirect('/carrito');
    }

    const line_items = user.carrito.map(item => {
      const producto = item.producto;
      const talla = item.talla;
      const precio = item.precio; // 0,50€ en céntimos

      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${producto.nombre} - Talla ${talla}`
          },
          unit_amount: Math.round(precio * 100)

        },
        quantity: item.cantidad
      };
    });

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${baseUrl}/pedido/confirmado`,
      cancel_url: `${baseUrl}/carrito?status=cancel`,
      customer_email: req.session.user.email // 🔥 Este es el cambio clave
    });

    res.redirect(303, session.url);
  } catch (error) {
    console.error('Error iniciando pago con Stripe:', error);
    res.status(500).send('Error al iniciar pago');
  }
};
