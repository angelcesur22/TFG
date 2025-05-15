// models/ProductoComunidad.js
const mongoose = require('mongoose');

const productoComunidadSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nombre: { type: String, required: true },
  marca: { type: String, required: true },
  modelo: { type: String },
  descripcion: { type: String },
  talla: { type: String, required: true },
  precio: { type: Number, required: true },
  estado: {
    type: String,
    enum: [
      'Completamente nuevo con la caja',
      'Nuevo sin la caja',
      'Muy bueno',
      'Bueno',
      'Satisfactorio'
    ],
    required: true
  },
  imagenes: [String],
  fecha: { type: Date, default: Date.now },
  vendido: { type: Boolean, default: false },
  estadoAdmin: {
    type: String,
    enum: ['revisión', 'aprobado', 'rechazado'],
    default: 'revisión'
  },
  motivoRechazo: {
  type: String,
  default: ''
}

});

module.exports = mongoose.model('ProductoComunidad', productoComunidadSchema);
