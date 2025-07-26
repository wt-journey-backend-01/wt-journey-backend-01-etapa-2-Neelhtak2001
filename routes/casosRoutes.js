//este arquivo define as rotas para os casos
// Importa o módulo express e o controlador de casos

const express = require('express');
const router = express.Router();
const casosController = require('../controllers/casosController');

router.get('/', casosController.listarCasos);
router.get('/:id', casosController.buscarCasoPorId);
router.post('/', casosController.criarCaso);
router.put('/:id', casosController.atualizarCaso);
router.patch('/:id', casosController.atualizarParcialmenteCaso);
router.delete('/:id', casosController.deletarCaso);

module.exports = router;