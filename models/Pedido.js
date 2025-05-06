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
        foto: String
      },
      cantidad: Number,
      talla: String,
      precio: Number
    }
  ],
  total: Number,
  estado: {
    type: String,
    enum: [
      'Pendiente',
      'En proceso',
      'Enviado',
      'Entregado',
      'Cancelado',
      'Solicitud de devolución',
      'Pendiente de devolución',
      'Devolución aceptada',
      'Devolución denegada',
      'Devuelto'
    ],
    default: 'Pendiente'
  },
  fecha: { type: String },

  // ➕ Campo para registrar devolución
  devolucion: {
    motivo: String,
    comentario: String,
    comentarioAdmin: String,
    fechaSolicitud: {
      type: Date,
      default: Date.now
    }
  }
});

module.exports = mongoose.model('Pedido', PedidoSchema);

