// controllers/agentesController.js

const agentesRepository = require('../repositories/agentesRepository');

// Função auxiliar para validar a data (pode ficar aqui ou em /utils)
function isDataValida(data) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(data)) return false;
    const dataObj = new Date(data);
    if (isNaN(dataObj.getTime())) return false;
    if (dataObj > new Date()) return false;
    return true;
}

// GET /agentes
function listarAgentes(req, res) {
    const agentes = agentesRepository.findAll();
    res.status(200).json(agentes);
}

// GET /agentes/:id
function buscarAgentePorId(req, res) {
    const { id } = req.params;
    const agente = agentesRepository.findById(id);
    if (!agente) {
        return res.status(404).json({ message: 'Agente não encontrado.' });
    }
    res.status(200).json(agente);
}

// POST /agentes
function criarAgente(req, res) {
    const { nome, dataDeIncorporacao, cargo } = req.body;
    if (!nome || !dataDeIncorporacao || !cargo) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    if (!isDataValida(dataDeIncorporacao)) {
        return res.status(400).json({ message: "Formato da dataDeIncorporacao inválido ou data no futuro." });
    }
    const novoAgente = agentesRepository.create({ nome, dataDeIncorporacao, cargo });
    res.status(201).json(novoAgente);
}

// PUT /agentes/:id (Atualização Completa)
function atualizarAgente(req, res) {
    const { id } = req.params;
    const dados = req.body;

    //Protegendo o campo 'id'
    if ('id' in dados) {
        return res.status(400).json({ message: 'Não é permitido alterar o campo id.' });
    }

    const { nome, dataDeIncorporacao, cargo } = dados;
    if (!nome || !dataDeIncorporacao || !cargo) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios para atualização completa.' });
    }
    if (!isDataValida(dataDeIncorporacao)) {
        return res.status(400).json({ message: "Formato da dataDeIncorporacao inválido ou data no futuro." });
    }

    const agenteAtualizado = agentesRepository.update(id, dados);
    if (!agenteAtualizado) {
        return res.status(404).json({ message: 'Agente não encontrado.' });
    }
    res.status(200).json(agenteAtualizado);
}

// PATCH /agentes/:id (Atualização Parcial)
function atualizarParcialmenteAgente(req, res) {
    const { id } = req.params;
    const dados = req.body;

//Protegendo o campo 'id' também no PATCH
    if ('id' in dados) {
        return res.status(400).json({ message: 'Não é permitido alterar o campo id.' });
    }

    // Valida a data, caso ela tenha sido enviada no corpo da requisição
    if (dados.dataDeIncorporacao && !isDataValida(dados.dataDeIncorporacao)) {
        return res.status(400).json({ message: "Formato da dataDeIncorporacao inválido ou data no futuro." });
    }

    const agenteAtualizado = agentesRepository.update(id, dados);
    if (!agenteAtualizado) {
        return res.status(404).json({ message: 'Agente não encontrado.' });
    }
    res.status(200).json(agenteAtualizado);
}

// DELETE /agentes/:id
function deletarAgente(req, res) {
    const { id } = req.params;
    const sucesso = agentesRepository.remove(id);
    if (!sucesso) {
        return res.status(404).json({ message: 'Agente não encontrado.' });
    }
    res.status(204).send();
}

module.exports = {
    listarAgentes,
    buscarAgentePorId,
    criarAgente,
    atualizarAgente,
    atualizarParcialmenteAgente,
    deletarAgente
};