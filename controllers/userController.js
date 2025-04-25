const Pedido = require('../models/Pedido'); // Asegúrate que la ruta del modelo Pedido es correcta
const User = require('../models/User');
// Función para listar usuarios
const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await User.find();
        res.render('listarUsuarios', { usuarios });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al obtener usuarios.");
    }
};

// Función para mostrar el formulario de edición de usuario
const mostrarEditarUsuario = async (req, res) => {
    try {
      const usuario = await User.findById(req.params.id);
      res.render('editarUsuario', { usuario });
    } catch (error) {
      console.log(error);
      res.redirect('/usuarios');
    }
  };

// Función para editar usuario
const editarUsuario = async (req, res) => {
  const { nombre, email, rol, verificado } = req.body; // 👈 añade "verificado" aquí

  try {
      const usuario = await User.findByIdAndUpdate(req.params.id, {
          nombre,
          email,
          rol,
          verificado: verificado === 'true' // 👈 convierte a booleano
      });

      res.redirect('/admin/usuarios');
  } catch (error) {
      console.error('Error al editar usuario:', error);
      res.status(500).send('Error al editar el usuario');
  }
};


// Función para eliminar usuario
const eliminarUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        await User.findByIdAndDelete(id);
        res.redirect('/admin/usuarios');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al eliminar el usuario.");
    }
};


exports.mostrarEditarUsuario = async (req, res) => {
  try {
      const usuario = await User.findById(req.params.id);

      if (!usuario) {
          return res.status(404).send('Usuario no encontrado.');
      }

      res.render('editarUsuario', { usuario }); // Renderiza la vista con el usuario encontrado
  } catch (error) {
      console.error('Error al obtener el usuario para editar:', error);
      res.status(500).send('Error al obtener el usuario.');
  }
};

exports.listarUsuarios = async (req, res) => {
  try {
      const usuarios = await User.find();
      res.render('listarUsuarios', { usuarios });
  } catch (error) {
      console.error('Error al listar usuarios:', error);
      res.status(500).send('Error al obtener la lista de usuarios.');
  }
};


const verPedidosDeUsuario = async (req, res) => {
    try {
        const usuarioId = req.params.id;
        
        const usuario = await User.findById(usuarioId);
        if (!usuario) return res.status(404).send('Usuario no encontrado.');

        const pedidos = await Pedido.find({ usuario: usuarioId }).populate('producto');

        res.render('verPedidosUsuario', { usuario, pedidos });
    } catch (error) {
        console.error('Error al obtener pedidos del usuario:', error);
        res.status(500).send('Error al obtener pedidos del usuario.');
    }
};

const verPerfil = async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
        .populate({
          path: 'pedidos',
          populate: {
            path: 'productos.producto'
          }
        });
  
        const pedidos = await Pedido.find({ usuario: req.user._id });

        const totalGastado = pedidos.reduce((acum, pedido) => acum + (pedido.total || 0), 0);
        const numPedidos = pedidos.length;
        const numDirecciones = req.user.direcciones?.length || 0;
        
  
        res.render('perfil', {
            user: req.user,        // ✅ 'user' es más estándar
            pedidos,
            totalGastado,
            numPedidos,
            numDirecciones
          });
          
    } catch (error) {
      console.error('[❌ ERROR PERFIL]:', error);
      res.status(500).send('Error al cargar perfil');
    }
  };
  
  
  

  
const actualizarPerfil = async (req, res) => {
    try {
      const { nombre, email } = req.body;
      await User.findByIdAndUpdate(req.user._id, { nombre, email });
      res.redirect('/perfil');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al actualizar el perfil');
    }
  };
exports.editarUsuario = editarUsuario;
exports.eliminarUsuario = eliminarUsuario;
exports.mostrarEditarUsuario = mostrarEditarUsuario;
exports.listarUsuarios = listarUsuarios;
exports.verPedidosDeUsuario = verPedidosDeUsuario;
exports.verPerfil = verPerfil;
exports.actualizarPerfil=actualizarPerfil;
