const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
  numeroPedido: String,
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  productos: [
    {
      producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
      cantidad: Number,
      precio: Number
    }
  ],
  total: Number,
  estado: { type: String, default: "pendiente" },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pedido', PedidoSchema);
