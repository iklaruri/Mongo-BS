var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var mdAutenticacion = require('../middlewares/autenticacion');

// ======================================
// Obtener hospitales
// ======================================

app.get('/', (req, res, next) => {

  var desde = req.query.desde || 0;
  desde = Number(desde);

  Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario','nombre email')
    .exec(
     (err,hospitales) => {
          if(err){
            return res.status(500).json({
              ok:false,
              mensaje:'Error cargando hospitales'
            });

          }

          Hospital.count({},(err,contador) => {
            res.status(200).json({
              ok:true,
              hospitales:hospitales,
              total:contador
            });
          });
  })
});

// ======================================
// Crear hospital
// ======================================

app.post('/', mdAutenticacion.verificarToken, (req,res) => {
  var body = req.body;

  var hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuario._id
  });

  hospital.save( (err,hospitalGuardado ) => {
    if(err){
      return res.status(400).json({
        ok:false,
        mensaje:'Error al crear hospital',
        errors: err
      });
    }

    res.status(201).json({
      ok:true,
      hospital:hospitalGuardado
    });
  });
});


// ======================================
// Actualizar hospital
// ======================================


app.put('/:id', mdAutenticacion.verificarToken, (req,res) => {

  var id = req.params.id;
  var body = req.body;

  Hospital.findById(id,(err,hospital) => {

    if(err){
      return res.status(500).json({
        ok:false,
        mensaje:'Error al buscar hospital',
        errors: err
      });
    }

    if(!hospital){
      return res.status(400).json({
        ok:false,
        mensaje:'Error al buscar el hospital con este id:' + id,
        errors: {message:'No existe hospital con ese id'}
      });
    }

    hospital.nombre = body.nombre;
    hospital.usuario = req.usuario._id;

    hospital.save( (err,hospitalActualizado ) => {
      if(err){
        return res.status(400).json({
          ok:false,
          mensaje:'Error al actualizar hospital',
          errors: err
        });
      }

      res.status(200).json({
        ok:true,
        hospital:hospitalActualizado
      });
    });
  });
});

// ======================================
// Borrar hospital
// ======================================

app.delete('/:id', mdAutenticacion.verificarToken, (req,res) => {

  var id = req.params.id;

  Hospital.findByIdAndRemove(id, (err,hospitalBorrado) => {

    if(err){
      return res.status(500).json({
        ok:false,
        mensaje:'Error al borrar usuario con este id:' + id,
        errors: err
      });
    }

    if(!hospitalBorrado){
      return res.status(400).json({
        ok:false,
        mensaje:'No existe un hospital con este id:' + id,
        errors: {message:'No existe hospital con ese id'}
      });
    }

    res.status(200).json({
      ok:true,
      hospital:hospitalBorrado
    });

  });

});


module.exports=app;
