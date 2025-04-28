const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/wishlist/toggle/:id', async (req, res) => {
  if (!req.user) return res.status(401).json({ success: false });

  try {
    const user = await User.findById(req.user._id); // sin populate

    const productoId = req.params.id;
    const yaExiste = user.wishlist.some(p => p.equals(productoId));

    if (!yaExiste) {
      user.wishlist.push(productoId);
    } else {
      user.wishlist = user.wishlist.filter(p => !p.equals(productoId));
    }

    await user.save();

    // ✅ Actualizar la sesión con la nueva wishlist
    req.session.user.wishlist = [...user.wishlist];

    res.json({ success: true, liked: !yaExiste });
  } catch (err) {
    console.error("❌ Error wishlist:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
