// controllers/agentesController.js

//zod
const agentesRepository = require('../repositories/agentesRepository');
const { z } = require('zod');

// FUNÇÃO CORRIGIDA: Validação de data mais robusta
function isDataValida(data) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(data)) return false; // Mantém a verificação de formato

    const dataObj = new Date(data + 'T00:00:00Z'); 
    if (dataObj.toISOString().slice(0, 10) !== data) {
        return false;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Normaliza a data de hoje para comparar apenas o dia

    // Garante que a data de incorporação não seja no futuro
    return dataObj <= hoje;
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
    message: "Formato da dataDeIncorporacao inválido, data inválida ou data no futuro." // Mensagem de erro melhorada
  }),
  
  cargo: z.string({ 
    required_error: "O campo 'cargo' é obrigatório.",
    invalid_type_error: "O campo 'cargo' deve ser uma string." 
  }).min(1, "O campo 'cargo' não pode ser vazio."),
}).strict({ message: "O corpo da requisição contém campos não permitidos." });

const agentePatchSchema = z.object({
  nome: z.string({ 
    required_error: "O campo 'nome' é obrigatório.",
    invalid_type_error: "O campo 'nome' deve ser uma string." 
  }).min(1, "O campo 'nome' não pode ser vazio.").optional(),
  
  dataDeIncorporacao: z.string({ 
    required_error: "O campo 'dataDeIncorporacao' é obrigatório.",
    invalid_type_error: "O campo 'dataDeIncorporacao' deve ser uma string." 
  }).refine(isDataValida, { 
    message: "Formato da dataDeIncorporacao inválido, data inválida ou data no futuro." // Mensagem de erro melhorada
  }).optional(),
  
  cargo: z.string({ 
    required_error: "O campo 'cargo' é obrigatório.",
    invalid_type_error: "O campo 'cargo' deve ser uma string." 
  }).min(1, "O campo 'cargo' não pode ser vazio.").optional(),
}).strict({ message: "O corpo da requisição contém campos não permitidos." }); // Rejeita campos extras


// GET /agentes
function listarAgentes(req, res) {
    const { sort, cargo } = req.query;
    
    if (sort && !['dataDeIncorporacao', '-dataDeIncorporacao'].includes(sort)) {
        return res.status(400).json({ 
            message: "Parâmetro 'sort' inválido. Use 'dataDeIncorporacao' ou '-dataDeIncorporacao'." 
        });
    }
    
    if (cargo && !['inspetor', 'delegado', 'investigador'].includes(cargo)) {
        return res.status(400).json({ 
            message: "Parâmetro 'cargo' inválido. Use 'inspetor', 'delegado' ou 'investigador'." 
        });
    }

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

// PUT /agentes/:id (Atualização Completa) 
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
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Payload inválido.",
                errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
            });
        }
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
}

// PATCH /agentes/:id (Atualização Parcial)
function atualizarParcialmenteAgente(req, res) {
    const { id } = req.params;
    
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Corpo da requisição não pode ser vazio.' });
    }
    
    if ('id' in req.body) {
        return res.status(400).json({ message: 'Não é permitido alterar o campo id.' });
    }
    
    try {
        // Valida o corpo da requisição com o schema de patch
        const dadosValidados = agentePatchSchema.parse(req.body);

        // Verifica primeiro se o agente que se deseja atualizar existe
        const agenteExiste = agentesRepository.findById(id);
        if (!agenteExiste) {
            return res.status(404).json({ message: `Agente com id ${id} não encontrado.` });
        }

        const agenteAtualizado = agentesRepository.update(id, dadosValidados);
        res.status(200).json(agenteAtualizado);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Payload inválido.",
                errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
            });
        }
        console.error('Erro inesperado:', error);
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