// Controllers para gerenciar agentes
//serve para: listar, buscar por id, criar, atualizar, atualizar parcialmente e deletar agentes
// o arquvo contem as funções que manipulam as requisições HTTP e interagem com o repositório de agentes


// controllers/agentesController.js

const { is } = require('zod/v4/locales');
const agentesRepository = require('../repositories/agentesRepository');

// Usa a função do repositório para listar todos
function listarAgentes(req, res) {
    const agentes = agentesRepository.findAll();
    res.status(200).json(agentes);
}

// Usa a função do repositório para buscar por ID
function buscarAgentePorId(req, res) {
    const { id } = req.params;
    const agente = agentesRepository.findById(id);
    if (!agente) {
        return res.status(404).json({ message: 'Agente não encontrado.' });
    }
    res.status(200).json(agente);
}

// Usa a função do repositório para criar
function criarAgente(req, res) {
    const { nome, dataDeIncorporacao, cargo } = req.body;
    
    if (!nome || !dataDeIncorporacao || !cargo) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    
    // VALIDAÇÃO DETALHADA ADICIONADA AQUI
    if (!isDataValida(dataDeIncorporacao)) {
        return res.status(400).json({ 
            message: "Parâmetros inválidos",
            errors: [
                { "dataDeIncorporacao": "Campo dataDeIncorporacao deve seguir a formatação 'YYYY-MM-DD' e não pode ser uma data futura." }
            ]
        });
    }
    
    const novoAgente = agentesRepository.create({ nome, dataDeIncorporacao, cargo });
    res.status(201).json(novoAgente);
}

// Usa a função do repositório para atualizar
function atualizarAgente(req, res) {
    const { id } = req.params;
    const agenteAtualizado = agentesRepository.update(id, req.body);
    if (!agenteAtualizado) {
        return res.status(404).json({ message: 'Agente não encontrado.' });
    }
    res.status(200).json(agenteAtualizado);
}

// O PATCH funciona da mesma forma que o PUT aqui
function atualizarParcialmenteAgente(req, res) {
    const { id } = req.params;
    const agenteAtualizado = agentesRepository.update(id, req.body);
    if (!agenteAtualizado) {
        return res.status(404).json({ message: 'Agente não encontrado.' });
    }
    res.status(200).json(agenteAtualizado);
}

// Usa a função do repositório para remover
function deletarAgente(req, res) {
    const { id } = req.params;
    const sucesso = agentesRepository.remove(id);
    if (!sucesso) {
        return res.status(404).json({ message: 'Agente não encontrado.' });
    }
    res.status(204).send();
}

function isDataValida(data) {
    // Regex para o formato YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(data)) return false;
    
    const dataObj = new Date(data);
    // Checa se a data é real (ex: 2023-02-30 é inválido)
    if (isNaN(dataObj.getTime())) return false;
    
    // Checa se a data não está no futuro
    if (dataObj > new Date()) return false;
    
    return true;
}


module.exports = {
    listarAgentes,
    buscarAgentePorId,
    criarAgente,
    atualizarAgente,
    atualizarParcialmenteAgente,
    deletarAgente,
    isDataValida
};