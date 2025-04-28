const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true },
  contraseña: { type: String, required: true },
  verificado: { type: Boolean, default: false },
  verificacionToken: String,
  rol: { type: String, default: 'usuario' },
  pedidos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pedido' }],
  carrito: [
    {
      producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
      talla: String,
      precio: Number,
      cantidad: { type: Number, default: 1 }
    }
  ],
  direcciones: [{
    tipo: String,
    calle: String,
    ciudad: String,
    codigoPostal: String,
    pais: String
  }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Producto' }]

});

module.exports = mongoose.model('User', userSchema);
