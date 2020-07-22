var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();

var Usuario = require('../models/usuario');
var mdAutenticacion = require('../middlewares/autenticacion');

// ======================================
// Obtener usuarios
// ======================================

app.get('/',(req,res,next) => {

  var desde = req.query.desde || 0;
  desde = Number(desde);

  Usuario.find({}, 'nombre email img role')
     .skip(desde)
     .limit(5)
     .exec(
     (err,usuarios) => {
          if(err){
            return res.status(500).json({
              ok:false,
              mensaje:'Error cargando usuarios'
            });
          }

          Usuario.count({},(err,contador) => {
            res.status(200).json({
              ok:true,
              usuarios:usuarios,
              total:contador
            });
          });


  })
});


// ======================================
// Crear usuario
// ======================================

app.post('/', (req,res) => {
  var body = req.body;

  var usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role
  });

  usuario.save( (err,usuarioGuardado ) => {
    if(err){
      return res.status(400).json({
        ok:false,
        mensaje:'Error al crear usuario',
        errors: err
      });
    }

    res.status(201).json({
      ok:true,
      usuario:usuarioGuardado,
      usuarioToken:req.usuario
    });
  });
});

// ======================================
// Actualizar usuario
// ======================================


app.put('/:id', mdAutenticacion.verificarToken, (req,res) => {

  var id = req.params.id;
  var body = req.body;

  Usuario.findById(id,(err,usuario) => {

    if(err){
      return res.status(500).json({
        ok:false,
        mensaje:'Error al buscar usuario',
        errors: err
      });
    }

    if(!usuario){
      return res.status(400).json({
        ok:false,
        mensaje:'Error al buscar el usuario con este id:' + id,
        errors: {message:'No existe usuario con ese id'}
      });
    }

    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.role = body.role;

    usuario.save( (err,usuarioActualizado ) => {
      if(err){
        return res.status(400).json({
          ok:false,
          mensaje:'Error al actualizar usuario',
          errors: err
        });
      }

      usuarioActualizado.password = ':)';

      res.status(200).json({
        ok:true,
        usuario:usuarioActualizado
      });
    });
  });
});

// ======================================
// Borrar usuario
// ======================================

app.delete('/:id', mdAutenticacion.verificarToken, (req,res) => {

  var id = req.params.id;

  Usuario.findByIdAndRemove(id, (err,usuarioBorrado) => {

    if(err){
      return res.status(500).json({
        ok:false,
        mensaje:'Error al borrar usuario con este id:' + id,
        errors: err
      });
    }

    if(!usuarioBorrado){
      return res.status(400).json({
        ok:false,
        mensaje:'No existe un usuario con este id:' + id,
        errors: {message:'No existe usuario con ese id'}
      });
    }

    res.status(200).json({
      ok:true,
      usuario:usuarioBorrado
    });

  });

});

module.exports=app;
