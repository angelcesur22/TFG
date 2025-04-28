const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
  numeroPedido: String,
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  productos: [
    {
      producto: {
        _id: mongoose.Schema.Types.ObjectId,
        nombre: String,
        marca: String,
        imagenes: [String] // ✅ añadimos esto
      },
      cantidad: Number,
      talla: String,
      precio: Number
    }
  ],
  total: Number,
  estado: { type: String, default: "Pendiente" },
  fecha: { type: String }
});

module.exports = mongoose.model('Pedido', PedidoSchema);
