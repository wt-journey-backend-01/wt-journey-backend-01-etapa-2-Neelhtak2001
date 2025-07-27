// controllers/agentesController.js

const agentesRepository = require('../repositories/agentesRepository');
const { z } = require('zod');

function isDataValida(data) {
    
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(data)) return false;
    const dataObj = new Date(data);
    if (dataObj.toISOString().slice(0, 10) !== data) {
        return false;
    }
     const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); 
    return new Date(data) <= hoje;
}

// Schema para POST e PUT (todos os campos obrigatórios)
const agenteSchema = z.object({
  nome: z.string({ 
    required_error: "O campo 'nome' é obrigatório.",
    invalid_type_error: "O campo 'nome' deve ser uma string." 
  }).min(1, "O campo 'nome' não pode ser vazio."),
  
  dataDeIncorporacao: z.string({ 
    required_error: "O campo 'dataDeIncorporacao' é obrigatório.",
    invalid_type_error: "O campo 'dataDeIncorporacao' deve ser uma string." 
  }).refine(isDataValida, { 
    message: "O campo 'dataDeIncorporacao' deve estar no formato YYYY-MM-DD, ser uma data válida e não pode ser no futuro." 
  }),
  
  cargo: z.string({ 
    required_error: "O campo 'cargo' é obrigatório.",
    invalid_type_error: "O campo 'cargo' deve ser uma string." 
  }).min(1, "O campo 'cargo' não pode ser vazio."),
}).strict({ message: "O corpo da requisição contém campos não permitidos." });

// Schema para PATCH, derivado do principal, mas com todos os campos opcionais.
const agentePatchSchema = agenteSchema.partial().strict({ message: "O corpo da requisição contém campos não permitidos." });


// GET /agentes
function listarAgentes(req, res) {
    const agentes = agentesRepository.findAll(req.query);
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
function criarAgente(req, res, next) {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Corpo da requisição não pode ser vazio." });
        }
        const dadosValidados = agenteSchema.parse(req.body);
        const novoAgente = agentesRepository.create(dadosValidados);
        res.status(201).json(novoAgente);
    } catch (error) {
        // Se a validação do Zod falhar, retorna 400 com os erros detalhados.
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Payload inválido.",
                errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
            });
        }
        // Para outros erros, passa para o errorHandler global.
        next(error);
    }
}

// PUT /agentes/:id (Atualização Completa) 
function atualizarAgente(req, res, next) {
    try {
        const { id } = req.params;
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Corpo da requisição não pode ser vazio." });
        }
        if ('id' in req.body) {
            return res.status(400).json({ message: 'Não é permitido alterar o campo id.' });
        }

        const dadosValidados = agenteSchema.parse(req.body);
        
        const agenteAtualizado = agentesRepository.update(id, dadosValidados);
        if (!agenteAtualizado) {
            return res.status(404).json({ message: 'Agente não encontrado.' });
        }
        res.status(200).json(agenteAtualizado);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Payload inválido.",
                errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
            });
        }
        next(error);
    }
}

// PATCH /agentes/:id (Atualização Parcial)
function atualizarParcialmenteAgente(req, res, next) {
    try {
        const { id } = req.params;
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: 'Corpo da requisição não pode ser vazio.' });
        }
        if ('id' in req.body) {
            return res.status(400).json({ message: 'Não é permitido alterar o campo id.' });
        }
        
        const agenteExiste = agentesRepository.findById(id);
        if (!agenteExiste) {
            return res.status(404).json({ message: `Agente com id ${id} não encontrado.` });
        }

        const dadosValidados = agentePatchSchema.parse(req.body);
        const agenteAtualizado = agentesRepository.update(id, dadosValidados);
        res.status(200).json(agenteAtualizado);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Payload inválido.",
                errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
            });
        }
        next(error);
    }
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