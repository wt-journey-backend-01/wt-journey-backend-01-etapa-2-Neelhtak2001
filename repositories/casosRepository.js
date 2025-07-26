// Este arquivo é responsável por gerenciar os dados dos casos
// e simula um banco de dados em memória

const casosRepository = require('../repositories/casosRepository');
const agentesRepository = require('../repositories/agentesRepository'); // Essencial para validar o agente_id

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
        return res.status(400).json({ message: 'Todos os campos são obrigatórios: titulo, descricao, status, agente_id.' });
    }
    if (status !== 'aberto' && status !== 'solucionado') {
        return res.status(400).json({ message: "O campo 'status' pode ser somente 'aberto' ou 'solucionado'" });
    }
    const agenteExiste = agentesRepository.findById(agente_id);
    if (!agenteExiste) {
        return res.status(400).json({ message: `Agente com id ${agente_id} não encontrado.` });
    }

    const novoCaso = casosRepository.create({ titulo, descricao, status, agente_id });
    res.status(201).json(novoCaso);
}

// PUT /casos/:id
function atualizarCaso(req, res) {
    const { id } = req.params;
    const { titulo, descricao, status, agente_id } = req.body;

    if ('id' in req.body) {
        return res.status(400).json({ message: 'Não é permitido alterar o ID do caso via payload.' });
    }

    if (!titulo || !descricao || !status || !agente_id) {
        return res.status(400).json({ message: 'Para atualização completa, todos os campos são obrigatórios.' });
    }
    if (status !== 'aberto' && status !== 'solucionado') {
       return res.status(400).json({ message: "O campo 'status' pode ser somente 'aberto' ou 'solucionado'" });
    }
    
    // 2. Validação do agente_id ao atualizar um Caso
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

// PATCH /casos/:id
function atualizarParcialmenteCaso(req, res) {
    const { id } = req.params;
    const dadosParaAtualizar = req.body;

    if (Object.keys(dadosParaAtualizar).length === 0) {
        return res.status(400).json({ message: 'Corpo da requisição (payload) não pode ser vazio.' });
    }

    if ('id' in dadosParaAtualizar) {
        return res.status(400).json({ message: 'Não é permitido alterar o ID do caso.' });
    }
    
    if (dadosParaAtualizar.status && dadosParaAtualizar.status !== 'aberto' && dadosParaAtualizar.status !== 'solucionado') {
        return res.status(400).json({ message: "O campo 'status' pode ser somente 'aberto' ou 'solucionado'" });
    }

    // 2. Validação condicional do agente_id
    if (dadosParaAtualizar.agente_id) {
        const agenteExiste = agentesRepository.findById(dadosParaAtualizar.agente_id);
        if (!agenteExiste) {
            return res.status(400).json({ message: `Agente com id ${dadosParaAtualizar.agente_id} não encontrado.` });
        }
    }

    const casoAtualizado = casosRepository.update(id, dadosParaAtualizar);
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