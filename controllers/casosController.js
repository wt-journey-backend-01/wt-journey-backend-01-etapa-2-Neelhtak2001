// Controllers para gerenciar casos
//serve para: listar, buscar por id, criar, atualizar, atualizar parcialmente e deletar casos
// o arquvo contem as funções que manipulam as requisições HTTP e interagem com o repositório de casos


const casosRepository = require('../repositories/casosRepository');// Importa o repositório de casos, os dados
const agentesRepository = require('../repositories/agentesRepository'); // Importa o repositório de agentes, necessário para validações

// GET /casos
function listarCasos(req, res) {
    const casos = casosRepository.findAll();
    res.status(200).json(casos);
}

// GET /casos/:id
function buscarCasoPorId(req, res) {
    const { id } = req.params;
    const caso = casosRepository.findById(id);

    if (!caso) {
        return res.status(404).json({ message: 'Caso não encontrado.' });
    }

    res.status(200).json(caso);
}

// POST /casos
function criarCaso(req, res) {
    const { titulo, descricao, status, agente_id } = req.body;
    const errors = [];

    // Validações
    if (!titulo || !descricao || !status || !agente_id) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios: titulo, descricao, status, agente_id.' });
    }
    if (status !== 'aberto' && status !== 'solucionado') {
        errors.push({ status: "O campo 'status' pode ser somente 'aberto' ou 'solucionado'" });
    }
    const agenteExiste = agentesRepository.findById(agente_id);
    if (!agenteExiste) {
        errors.push({ agente_id: `Agente com id ${agente_id} não encontrado.` });
    }

    // Bônus: Resposta de erro personalizada
    if (errors.length > 0) {
        return res.status(400).json({
            status: 400,
            message: "Parâmetros inválidos",
            errors: errors
        });
    }

    const novoCaso = casosRepository.create({ titulo, descricao, status, agente_id });
    res.status(201).json(novoCaso);
}

// PUT /casos/:id
function atualizarCaso(req, res) {
    const { id } = req.params;
    const { titulo, descricao, status, agente_id } = req.body;

    if (!titulo || !descricao || !status || !agente_id) {
        return res.status(400).json({ message: 'Para atualização completa, todos os campos são obrigatórios.' });
    }
     if (status !== 'aberto' && status !== 'solucionado') {
        return res.status(400).json({ message: "O campo 'status' pode ser somente 'aberto' ou 'solucionado'" });
    }

    const casoAtualizado = casosRepository.update(id, { titulo, descricao, status, agente_id });

    if (!casoAtualizado) {
        return res.status(404).json({ message: 'Caso não encontrado.' });
    }

    res.status(200).json(casoAtualizado);
}

// PATCH /casos/:id
function atualizarParcialmenteCaso(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    if (status && status !== 'aberto' && status !== 'solucionado') {
        return res.status(400).json({ message: "O campo 'status' pode ser somente 'aberto' ou 'solucionado'" });
    }

    const casoAtualizado = casosRepository.update(id, req.body);
    if (!casoAtualizado) {
        return res.status(404).json({ message: 'Caso não encontrado.' });
    }
    res.status(200).json(casoAtualizado);
}

// DELETE /casos/:id
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