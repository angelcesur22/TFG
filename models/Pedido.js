const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
    numeroPedido: String,  // Esto está perfecto.
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
    cantidad: Number,
    estado: String,
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pedido', PedidoSchema);
