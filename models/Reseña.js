const mongoose = require('mongoose');

const reseñaSchema = new mongoose.Schema({
  autor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comentario: {
    type: String,
    required: true,
    trim: true
  },
  valoracion: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reseña', reseñaSchema);
