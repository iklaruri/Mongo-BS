var express = require('express');

var app = express();

var Medico = require('../models/medico');
var mdAutenticacion = require('../middlewares/autenticacion');

// ======================================
// Obtener medicos
// ======================================

app.get('/',(req,res,next) => {

  var desde = req.query.desde || 0;
  desde = Number(desde);

  Medico.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario','nombre email')
    .populate('hospital')
    .exec(
     (err,medicos) => {
          if(err){
            return res.status(500).json({
              ok:false,
              mensaje:'Error cargando medicos'
            });

          }

          Medico.count({},(err,contador) => {
            res.status(200).json({
              ok:true,
              medicos:medicos,
              total:contador
            });
          });
  })
});

// ======================================
// Crear medico
// ======================================

app.post('/', mdAutenticacion.verificarToken, (req,res) => {
  var body = req.body;

  var medico = new Medico({
    nombre: body.nombre,
    usuario: req.usuario._id,
    hospital: body.hospital,
  });

  medico.save( (err,medicoGuardado ) => {
    if(err){
      return res.status(400).json({
        ok:false,
        mensaje:'Error al crear medico',
        errors: err
      });
    }

    res.status(201).json({
      ok:true,
      medico:medicoGuardado
    });
  });
});


// ======================================
// Actualizar medico
// ======================================


app.put('/:id', mdAutenticacion.verificarToken, (req,res) => {

  var id = req.params.id;
  var body = req.body;

  Medico.findById(id,(err,medico) => {

    if(err){
      return res.status(500).json({
        ok:false,
        mensaje:'Error al buscar medico',
        errors: err
      });
    }

    if(!medico){
      return res.status(400).json({
        ok:false,
        mensaje:'Error al buscar el medico con este id:' + id,
        errors: {message:'No existe medico con ese id'}
      });
    }

    medico.nombre = body.nombre;
    medico.usuario = req.usuario._id;
    medico.hospital = body.hospital;

    medico.save( (err,medicoActualizado ) => {
      if(err){
        return res.status(400).json({
          ok:false,
          mensaje:'Error al actualizar medico',
          errors: err
        });
      }

      res.status(200).json({
        ok:true,
        medico:medicoActualizado
      });
    });
  });
});

// ======================================
// Borrar medico
// ======================================

app.delete('/:id', mdAutenticacion.verificarToken, (req,res) => {

  var id = req.params.id;

  Medico.findByIdAndRemove(id, (err,medicoBorrado) => {

    if(err){
      return res.status(500).json({
        ok:false,
        mensaje:'Error al borrar medico con este id:' + id,
        errors: err
      });
    }

    if(!medicoBorrado){
      return res.status(400).json({
        ok:false,
        mensaje:'No existe un medico con este id:' + id,
        errors: {message:'No existe medico con ese id'}
      });
    }

    res.status(200).json({
      ok:true,
      medico:medicoBorrado
    });

  });

});


module.exports=app;
