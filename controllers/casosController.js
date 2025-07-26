// Controllers para gerenciar casos
//serve para: listar, buscar por id, criar, atualizar, atualizar parcialmente e deletar casos
// o arquvo contem as funções que manipulam as requisições HTTP e interagem com o repositório de casos


// controllers/casosController.js

const casosRepository = require('../repositories/casosRepository');
const agentesRepository = require('../repositories/agentesRepository'); // Importamos para validar o agente_id

// Lista todos os casos
function listarCasos(req, res) {
    const casos = casosRepository.findAll();
    res.status(200).json(casos);
}

// Busca um caso específico pelo ID
function buscarCasoPorId(req, res) {
    const { id } = req.params;
    const caso = casosRepository.findById(id);
    if (!caso) {
        return res.status(404).json({ message: 'Caso não encontrado.' });
    }
    res.status(200).json(caso);
}

// Cria um novo caso
function criarCaso(req, res) {
    const { titulo, descricao, status, agente_id } = req.body;

    // Validações
    if (!titulo || !descricao || !status || !agente_id) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    if (status !== 'aberto' && status !== 'solucionado') {
        return res.status(400).json({ message: "O campo 'status' pode ser somente 'aberto' ou 'solucionado'." });
    }
    // Validação importante: verifica se o agente responsável realmente existe
    const agenteExiste = agentesRepository.findById(agente_id);
    if (!agenteExiste) {
        return res.status(400).json({ message: `Agente com id ${agente_id} não encontrado.` });
    }

    const novoCaso = casosRepository.create({ titulo, descricao, status, agente_id });
    res.status(201).json(novoCaso);
}

// Atualiza um caso por completo (PUT)
function atualizarCaso(req, res) {
    const { id } = req.params;
    const { titulo, descricao, status, agente_id } = req.body;

    // Validações
    if (!titulo || !descricao || !status || !agente_id) {
        return res.status(400).json({ message: 'Para atualização completa, todos os campos são obrigatórios.' });
    }
    if (status !== 'aberto' && status !== 'solucionado') {
        return res.status(400).json({ message: "O campo 'status' pode ser somente 'aberto' ou 'solucionado'." });
    }
    const agenteExiste = agentesRepository.findById(agente_id);
    if (!agenteExiste) {
        return res.status(400).json({ message: `Agente com id ${agente_id} não encontrado.` });
    }

    const casoAtualizado = casosRepository.update(id, { titulo, descricao, status, agente_id });
    if (!casoAtualizado) {
        return res.status(404).json({ message: 'Caso não encontrado.' });
    }
    res.status(200).json(casoAtualizado);
}

// Atualiza um caso parcialmente (PATCH)
function atualizarParcialmenteCaso(req, res) {
    const { id } = req.params;
    const dadosParaAtualizar = req.body;

    // Se o agente_id estiver sendo atualizado, verifica se o novo agente existe
    if (dadosParaAtualizar.agente_id) {
        const agenteExiste = agentesRepository.findById(dadosParaAtualizar.agente_id);
        if (!agenteExiste) {
            return res.status(400).json({ message: `Agente com id ${dadosParaAtualizar.agente_id} não encontrado.` });
        }
    }
    // Se o status estiver sendo atualizado, verifica se é válido
    if (dadosParaAtualizar.status && dadosParaAtualizar.status !== 'aberto' && dadosParaAtualizar.status !== 'solucionado') {
        return res.status(400).json({ message: "O campo 'status' pode ser somente 'aberto' ou 'solucionado'." });
    }

    const casoAtualizado = casosRepository.update(id, dadosParaAtualizar);
    if (!casoAtualizado) {
        return res.status(404).json({ message: 'Caso não encontrado.' });
    }
    res.status(200).json(casoAtualizado);
}

// Remove um caso
function deletarCaso(req, res) {
    const { id } = req.params;
    const sucesso = casosRepository.remove(id);
    if (!sucesso) {
        return res.status(404).json({ message: 'Caso não encontrado.' });
    }
    res.status(204).send();
}

module.exports = {
    listarCasos,
    buscarCasoPorId,
    criarCaso,
    atualizarCaso,
    atualizarParcialmenteCaso,
    deletarCaso
};