// Controllers para gerenciar casos
//serve para: listar, buscar por id, criar, atualizar, atualizar parcialmente e deletar casos
// o arquvo contem as funções que manipulam as requisições HTTP e interagem com o repositório de casos


// controllers/casosController.js

// controllers/casosController.js

const casosRepository = require('../repositories/casosRepository');
const agentesRepository = require('../repositories/agentesRepository');

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
    if (!titulo || !descricao || !status || !agente_id) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    if (status !== 'aberto' && status !== 'solucionado') {
        return res.status(400).json({ message: "O campo 'status' pode ser somente 'aberto' ou 'solucionado'." });
    }

    // PONTO 2 DO FEEDBACK: Garantindo que o agente_id é válido
    const agenteExiste = agentesRepository.findById(agente_id);
    if (!agenteExiste) {
        // Retornando 400 (Bad Request), pois o erro é do cliente que enviou o ID errado.
        return res.status(400).json({ message: `Agente com id ${agente_id} não encontrado.` });
    }

    const novoCaso = casosRepository.create({ titulo, descricao, status, agente_id });
    res.status(201).json(novoCaso);
}

// PUT /casos/:id (Atualização Completa)
function atualizarCaso(req, res) {
    const { id } = req.params;
    const dados = req.body;

    // PONTO 3 DO FEEDBACK: Protegendo o campo 'id'
    if ('id' in dados) {
        return res.status(400).json({ message: 'Não é permitido alterar o campo id.' });
    }

    const { titulo, descricao, status, agente_id } = dados;
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

    const casoAtualizado = casosRepository.update(id, dados);
    if (!casoAtualizado) {
        return res.status(404).json({ message: 'Caso não encontrado.' });
    }
    res.status(200).json(casoAtualizado);
}

// PATCH /casos/:id (Atualização Parcial)
function atualizarParcialmenteCaso(req, res) {
    const { id } = req.params;
    const dados = req.body;

    // PONTO 3 DO FEEDBACK: Protegendo o campo 'id' também no PATCH
    if ('id' in dados) {
        return res.status(400).json({ message: 'Não é permitido alterar o campo id.' });
    }

    if (dados.agente_id) {
        const agenteExiste = agentesRepository.findById(dados.agente_id);
        if (!agenteExiste) {
            return res.status(400).json({ message: `Agente com id ${dados.agente_id} não encontrado.` });
        }
    }
    if (dados.status && (dados.status !== 'aberto' && dados.status !== 'solucionado')) {
        return res.status(400).json({ message: "O campo 'status' pode ser somente 'aberto' ou 'solucionado'." });
    }

    const casoAtualizado = casosRepository.update(id, dados);
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