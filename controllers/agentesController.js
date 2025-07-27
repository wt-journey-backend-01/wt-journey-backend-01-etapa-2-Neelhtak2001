// controllers/agentesController.js

//zod
const agentesRepository = require('../repositories/agentesRepository');
const { z } = require('zod');
// Função auxiliar para validar a data (pode ficar aqui ou em /utils)
function isDataValida(data) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(data)) return false;
    const dataObj = new Date(data);
    if (isNaN(dataObj.getTime())) return false;
    if (dataObj > new Date()) return false;
    return true;
}

const agentePatchSchema = z.object({
  nome: z.string({ 
    required_error: "O campo 'nome' é obrigatório.",
    invalid_type_error: "O campo 'nome' deve ser uma string." 
  }).min(1, "O campo 'nome' não pode ser vazio.").optional(),
  
  dataDeIncorporacao: z.string({ 
    required_error: "O campo 'dataDeIncorporacao' é obrigatório.",
    invalid_type_error: "O campo 'dataDeIncorporacao' deve ser uma string." 
  }).refine(isDataValida, { 
    message: "Formato da dataDeIncorporacao inválido ou data no futuro." 
  }).optional(),
  
  cargo: z.string({ 
    required_error: "O campo 'cargo' é obrigatório.",
    invalid_type_error: "O campo 'cargo' deve ser uma string." 
  }).min(1, "O campo 'cargo' não pode ser vazio.").optional(),
}).strict({ message: "O corpo da requisição contém campos não permitidos." }); // Rejeita campos extras


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
    
    // Verificar se o corpo da requisição está vazio
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Corpo da requisição não pode ser vazio.' });
    }
    
    // Verificar se está tentando alterar o campo id
    if ('id' in req.body) {
        return res.status(400).json({ message: 'Não é permitido alterar o campo id.' });
    }
    
    try {
        const dadosValidados = agentePatchSchema.parse(req.body); 
        
        // CORREÇÃO: Usar o id da URL, não buscar agente_id no body
        const agenteExiste = agentesRepository.findById(id);
        if (!agenteExiste) {
            return res.status(404).json({ message: `Agente com id ${id} não encontrado.` });
        }

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
        // Log do erro para debugging
        console.error('Erro inesperado:', error);
        // Para outros erros inesperados
        return res.status(500).json({ message: "Erro interno do servidor." });
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