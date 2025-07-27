// controllers/agentesController.js

const agentesRepository = require('../repositories/agentesRepository');
const { z } = require('zod');

function isDataValida(data) {
    const [ano, mes, dia] = data.split('-').map(Number);
    const dataInput = new Date(ano, mes - 1, dia);
    
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);
    
    return dataInput <= hoje;
}

const agenteSchema = z.object({
  nome: z.string({ required_error: "O campo 'nome' é obrigatório." }).min(1, "O campo 'nome' não pode ser vazio."),
  
  dataDeIncorporacao: z.string({ required_error: "O campo 'dataDeIncorporacao' é obrigatório." })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "O campo 'dataDeIncorporacao' deve estar no formato YYYY-MM-DD.")
    .refine(isDataValida, { 
      message: "A data de incorporação deve ser válida e não pode ser no futuro." 
    }),
    
  cargo: z.string({ required_error: "O campo 'cargo' é obrigatório." }).min(1, "O campo 'cargo' não pode ser vazio."),
}).strict({ message: "O corpo da requisição contém campos não permitidos." });

const agentePatchSchema = agenteSchema.partial().strict({ message: "O corpo da requisição contém campos não permitidos." });

function listarAgentes(req, res) {
    res.status(200).json(agentesRepository.findAll(req.query));
}

function buscarAgentePorId(req, res) {
    const agente = agentesRepository.findById(req.params.id);
    if (!agente) return res.status(404).json({ message: 'Agente não encontrado.' });
    res.status(200).json(agente);
}

// POST /agentes
function criarAgente(req, res) {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Corpo da requisição não pode ser vazio." });
    }

    try {
        const dadosValidados = agenteSchema.parse(req.body);
        const novoAgente = agentesRepository.create(dadosValidados);
        res.status(201).json(novoAgente);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Payload inválido.",
                errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
            });
        }
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
}

// PUT /agentes/:id
function atualizarAgente(req, res) {
    const { id } = req.params;

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Corpo da requisição não pode ser vazio." });
    }

    if ('id' in req.body) {
        return res.status(400).json({ message: 'Não é permitido alterar o campo id.' });
    }

    try {
        const dadosValidados = agenteSchema.parse(req.body);
        
        const agenteAtualizado = agentesRepository.update(id, dadosValidados);
        if (!agenteAtualizado) {
            return res.status(404).json({ message: 'Agente não encontrado.' });
        }
        res.status(200).json(agenteAtualizado);
    } catch (error) {
        console.log('PUT ERRO:', error.name, error.constructor.name);
        
        // Forçar 400 independente do tipo de erro
        return res.status(400).json({
            message: "Payload inválido.",
            debug_error: error.message
        });
    }
}

// PATCH /agentes/:id
function atualizarParcialmenteAgente(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Corpo da requisição não pode ser vazio.' });
    }
    
    if ('id' in req.body) {
        return res.status(400).json({ message: 'Não é permitido alterar o campo id.' });
    }
    
    try {
        const dadosValidados = agentePatchSchema.parse(req.body);
        const agenteAtualizado = agentesRepository.update(req.params.id, dadosValidados);
        if (!agenteAtualizado) return res.status(404).json({ message: 'Agente não encontrado.' });
        res.status(200).json(agenteAtualizado);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Payload inválido.",
                errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
            });
        }
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

function deletarAgente(req, res) {
    const sucesso = agentesRepository.remove(req.params.id);
    if (!sucesso) return res.status(404).json({ message: 'Agente não encontrado.' });
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