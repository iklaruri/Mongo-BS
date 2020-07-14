var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

app.use(fileUpload());

app.put('/:tipo/:id',(req,res,next) => {

  var tipo = req.params.tipo;
  var id = req.params.id;

  // Tipos de colecciones
  var tiposValidos = ['hospital','medico','usuario'];
  if(tiposValidos.indexOf(tipo) < 0){
    return res.status(400).json({
      ok:false,
      mensaje:'Tipo no valido',
      error:{message:'Las tipos válidos son ' + tiposValidos.join(', ')}
    });
  }


  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      ok:false,
      mensaje:'No seleccionó nada',
      error:{message:'Debe de seleccionar una imágen'}
    });
  }

  // Obtener nombre del archivo
  var archivo = req.files.imagen;
  var nombreArchivoSplit = archivo.name.split('.');
  var extensionArchivo = nombreArchivoSplit[nombreArchivoSplit.length -1];

  // Extensiones validas
  var extensionesValidas = ['png','jpg','gif','jpeg'];

  if(extensionesValidas.indexOf(extensionArchivo) < 0){
    return res.status(400).json({
      ok:false,
      mensaje:'Extensión no válida',
      error:{message:'Las extensiones válidas son ' + extensionesValidas.join(', ')}
    });
  }

  // Nombre de archivo personalizado
  // 12223154-123
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

  // Mover el archivo temporal a un path
  var path = `./uploads/${tipo}/${nombreArchivo}`;
  archivo.mv(path , err => {
    if(err){
      return res.status(500).json({
        ok:false,
        mensaje:'Error al mover el archivo',
        error:err
      });
    }
    subirPorTipo(tipo,id,nombreArchivo,res);
 });
});

function subirPorTipo(tipo,id,nombreArchivo,res){
  switch (tipo) {
    case 'usuario':
        Usuario.findById(id, (err, usuario) => {
          var pathAntiguo = '.uploads/usuario' + usuario.img;
          eliminarImagenAnterior(pathAntiguo);
          usuario.img = nombreArchivo;
          usuario.save((err, usuarioActualizado) => {
            return res.status(200).json({
              ok:true,
              mensaje:'Imagén de usuario actualizado',
              usuarioActualizado:usuarioActualizado
            });
          });

        });
      break;

    case 'medico':
        Medico.findById(id, (err, medico) => {
          var pathAntiguo = '.uploads/medico' + medico.img;
          eliminarImagenAnterior(pathAntiguo);
          medico.img = nombreArchivo;
          medico.save((err, medicoActualizado) => {
            return res.status(200).json({
              ok:true,
              mensaje:'Imagén de médico actualizado',
              medicoActualizado:medicoActualizado
            });
          });
        });

      break;

    case 'hospital':
          Hospital.findById(id, (err, hospital) => {
            var pathAntiguo = '.uploads/hospital' + hospital.img;
            eliminarImagenAnterior(pathAntiguo);
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
              return res.status(200).json({
                ok:true,
                mensaje:'Imagén de hospital actualizado',
                hospitalActualizado:hospitalActualizado
              });
            });
          });
      break;

    default:

      return res.status(400).json({
        ok:true,
        mensaje:'Error al actualizar la imagen de ' + tipo,
        err:{message:'No existe esa colección en la BD'}
      });

      break;
  }
}


function eliminarImagenAnterior(pathAntiguo){
  if(fs.existsSync(pathAntiguo)){
    fs.unlink(pathAntiguo);
  }
}

module.exports=app;
