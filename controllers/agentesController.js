// Controllers para gerenciar agentes
//serve para: listar, buscar por id, criar, atualizar, atualizar parcialmente e deletar agentes
// o arquvo contem as funções que manipulam as requisições HTTP e interagem com o repositório de agentes


const agentesRepository = require('../repositories/agentesRepository'); // Importa o repositório de agentes, os dados
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

    // Validação simples
    if (!nome || !dataDeIncorporacao || !cargo) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios: nome, dataDeIncorporacao, cargo.' });
    }

    const novoAgente = agentesRepository.create({ nome, dataDeIncorporacao, cargo });
    res.status(201).json(novoAgente);
}

// PUT /agentes/:id
function atualizarAgente(req, res) {
    const { id } = req.params;
    const { nome, dataDeIncorporacao, cargo } = req.body;

    if (!nome || !dataDeIncorporacao || !cargo) {
        return res.status(400).json({ message: 'Para atualização completa, todos os campos são obrigatórios: nome, dataDeIncorporacao, cargo.' });
    }

    const agenteAtualizado = agentesRepository.update(id, { nome, dataDeIncorporacao, cargo });

    if (!agenteAtualizado) {
        return res.status(404).json({ message: 'Agente não encontrado.' });
    }

    res.status(200).json(agenteAtualizado);
}

// PATCH /agentes/:id
function atualizarParcialmenteAgente(req, res) {
    const { id } = req.params;
    const agenteAtualizado = agentesRepository.update(id, req.body);

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

    res.status(204).send(); // 204 No Content
}


module.exports = {
    listarAgentes,
    buscarAgentePorId,
    criarAgente,
    atualizarAgente,
    atualizarParcialmenteAgente,
    deletarAgente
};