// controllers/casosController.js

const casosRepository = require('../repositories/casosRepository');
const agentesRepository = require('../repositories/agentesRepository');
const { z } = require('zod');

const casoSchema = z.object({
  titulo: z.string({ required_error: "O campo 'titulo' é obrigatório." }).min(1, "O campo 'titulo' não pode ser vazio."),
  descricao: z.string({ required_error: "O campo 'descricao' é obrigatório." }).min(1, "O campo 'descricao' não pode ser vazio."),
  status: z.enum(['aberto', 'solucionado'], { errorMap: () => ({ message: "O campo 'status' deve ser 'aberto' ou 'solucionado'." }) }),
  agente_id: z.string({ required_error: "O campo 'agente_id' é obrigatório." }).uuid({ message: "O 'agente_id' deve ser um UUID válido." })
}).strict({ message: "O corpo da requisição contém campos não permitidos." });

const casoPatchSchema = casoSchema.partial().strict({ message: "O corpo da requisição contém campos não permitidos." });

function listarCasos(req, res) {
    res.status(200).json(casosRepository.findAll(req.query));
}

function buscarCasoPorId(req, res) {
    const caso = casosRepository.findById(req.params.id);
    if (!caso) return res.status(404).json({ message: 'Caso não encontrado.' });
    res.status(200).json(caso);
}

function criarCaso(req, res) {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Corpo da requisição não pode ser vazio." });
    }

    try {
        const dadosValidados = casoSchema.parse(req.body);
        const agenteExiste = agentesRepository.findById(dadosValidados.agente_id);
        if (!agenteExiste) {
            return res.status(404).json({ message: `Agente com id ${dadosValidados.agente_id} não encontrado.` });
        }
        const novoCaso = casosRepository.create(dadosValidados);
        res.status(201).json(novoCaso);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Payload inválido.",
                errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
            });
        }
        console.error('Erro inesperado em criarCaso:', error);
        return res.status(500).json({ message: 'Ocorreu um erro inesperado no servidor.' });
    }
}

function atualizarCaso(req, res) {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Corpo da requisição não pode ser vazio." });
    }
    
    if ('id' in req.body) {
        return res.status(400).json({ message: 'Não é permitido alterar o campo id.' });
    }

    try {
        const dadosValidados = casoSchema.parse(req.body);
        const agenteExiste = agentesRepository.findById(dadosValidados.agente_id);
        if (!agenteExiste) {
            return res.status(404).json({ message: `Agente com id ${dadosValidados.agente_id} não encontrado.` });
        }
        const casoAtualizado = casosRepository.update(req.params.id, dadosValidados);
        if (!casoAtualizado) return res.status(404).json({ message: 'Caso não encontrado.' });
        res.status(200).json(casoAtualizado);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Payload inválido.",
                errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
            });
        }
        console.error('Erro inesperado em atualizarCaso:', error);
        return res.status(500).json({ message: 'Ocorreu um erro inesperado no servidor.' });
    }
}

function atualizarParcialmenteCaso(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Corpo da requisição não pode ser vazio.' });
    }
    
    if ('id' in req.body) {
        return res.status(400).json({ message: 'Não é permitido alterar o campo id.' });
    }
    
    try {
        const dadosValidados = casoPatchSchema.parse(req.body);
        if (dadosValidados.agente_id) {
            const agenteExiste = agentesRepository.findById(dadosValidados.agente_id);
            if (!agenteExiste) return res.status(404).json({ message: `Agente com id ${dadosValidados.agente_id} não encontrado.` });
        }
        const casoAtualizado = casosRepository.update(req.params.id, dadosValidados);
        if (!casoAtualizado) return res.status(404).json({ message: 'Caso não encontrado.' });
        res.status(200).json(casoAtualizado);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Payload inválido.",
                errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
            });
        }
        console.error('Erro inesperado em atualizarParcialmenteCaso:', error);
        return res.status(500).json({ message: 'Ocorreu um erro inesperado no servidor.' });
    }
}

function deletarCaso(req, res) {
    const sucesso = casosRepository.remove(req.params.id);
    if (!sucesso) return res.status(404).json({ message: 'Caso não encontrado.' });
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
