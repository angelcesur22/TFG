const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
  numeroPedido: String,
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  productos: [
    {
      producto: {
        _id: mongoose.Schema.Types.ObjectId,
        nombre: String,
        marca: String
      },
      cantidad: Number,
      talla: String,
      precio: Number
    }
  ],
  total: Number,
  estado: { type: String, default: "Pendiente" },
  fecha: { type: String } // fecha ya formateada como string legible
});

module.exports = mongoose.model('Pedido', PedidoSchema);
