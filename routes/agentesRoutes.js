//este arquivo define as rotas para os agentes
// Importa o módulo express e o controlador de agentes


const express = require('express');
const router = express.Router();
const agentesController = require('../controllers/agentesController');

// Rota para listar todos os agentes (GET /)
router.get('/', agentesController.listarAgentes);

// Rota para buscar um agente por ID (GET /:id)
router.get('/:id', agentesController.buscarAgentePorId);

// Rota para criar um novo agente (POST /)
router.post('/', agentesController.criarAgente);

// Rota para atualizar um agente por completo (PUT /:id)
router.put('/:id', agentesController.atualizarAgente);

// Rota para atualizar um agente parcialmente (PATCH /:id)
router.patch('/:id', agentesController.atualizarParcialmenteAgente);

// Rota para deletar um agente (DELETE /:id)
router.delete('/:id', agentesController.deletarAgente);

module.exports = router;