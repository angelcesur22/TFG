const mongoose = require('mongoose');

const tallaSchema = new mongoose.Schema({
  talla: String,     // "40", "L", "M", etc.
  precio: Number,
  stock: Number
}, { _id: false });

const productoSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['zapatilla', 'ropa'],
    required: true
  },
  nombre: { type: String, required: true }, // Ej: Air Max 90, Sudadera Nike
  descripcion: String,
  marca: String,
  categoria: String, // opcional: camiseta, sudadera, pantalón
  imagenes: [String],    // futura URL
  tallas: [tallaSchema],
  etiqueta: {
    type: String,
    enum: ['new', 'bestseller', 'sale', 'none'],
    default: 'none'
  }, // lista de tallas con precio y stock
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  rebaja: {
    type: Boolean,
    default: false
  },
  precioAnterior: {
    type: Number,
    default: 0
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
  
  
  
});

module.exports = mongoose.model('Producto', productoSchema);
