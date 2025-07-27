const casosRepository = require('../repositories/casosRepository');
const agentesRepository = require('../repositories/agentesRepository');
const { z } = require('zod');

// Schema para POST e PUT
const casoSchema = z.object({
  titulo: z.string({ 
    required_error: "O campo 'titulo' é obrigatório.",
    invalid_type_error: "O campo 'titulo' deve ser uma string."
  }).min(1, "O campo 'titulo' não pode ser vazio."),
  
  descricao: z.string({ 
    required_error: "O campo 'descricao' é obrigatório.",
    invalid_type_error: "O campo 'descricao' deve ser uma string."
  }).min(1, "O campo 'descricao' não pode ser vazio."),
  
  status: z.enum(['aberto', 'solucionado'], { 
    errorMap: () => ({ message: "O campo 'status' deve ser 'aberto' ou 'solucionado'." })
  }),
  
  agente_id: z.string({ 
    required_error: "O campo 'agente_id' é obrigatório.",
    invalid_type_error: "O campo 'agente_id' deve ser uma string."
  }).uuid({ message: "O 'agente_id' deve ser um UUID válido." })
}).strict({ message: "O corpo da requisição contém campos não permitidos." });

// Schema para PATCH
const casoPatchSchema = casoSchema.partial().strict({ message: "O corpo da requisição contém campos não permitidos." });

// GET /casos
function listarCasos(req, res) {
    const casos = casosRepository.findAll(req.query);
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
function criarCaso(req, res, next) {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Corpo da requisição não pode ser vazio." });
        }
        
       
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
        next(error);
    }
}

// PUT /casos/:id (Atualização Completa)
function atualizarCaso(req, res, next) {
    try {
        const { id } = req.params;
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Corpo da requisição não pode ser vazio." });
        }
        if ('id' in req.body) {
            return res.status(400).json({ message: 'Não é permitido alterar o campo id.' });
        }

        const dadosValidados = casoSchema.parse(req.body);

        const agenteExiste = agentesRepository.findById(dadosValidados.agente_id);
        if (!agenteExiste) {
            return res.status(404).json({ message: `Agente com id ${dadosValidados.agente_id} não encontrado.` });
        }

        const casoAtualizado = casosRepository.update(id, dadosValidados);
        if (!casoAtualizado) {
            return res.status(404).json({ message: 'Caso não encontrado.' });
        }
        res.status(200).json(casoAtualizado);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Payload inválido para atualização completa.",
                errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
            });
        }
        next(error);
    }
}

// PATCH /casos/:id (Atualização Parcial)
function atualizarParcialmenteCaso(req, res, next) {
    try {
        const { id } = req.params;
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: 'Corpo da requisição não pode ser vazio.' });
        }
        if ('id' in req.body) {
            return res.status(400).json({ message: 'Não é permitido alterar o campo id.' });
        }
        
        const casoExiste = casosRepository.findById(id);
        if (!casoExiste) {
            return res.status(404).json({ message: 'Caso não encontrado.' });
        }
        
        const dadosValidados = casoPatchSchema.parse(req.body);
        
        if (dadosValidados.agente_id) {
            const agenteExiste = agentesRepository.findById(dadosValidados.agente_id);
            if (!agenteExiste) {
                return res.status(404).json({ 
                    message: `Agente com id ${dadosValidados.agente_id} não encontrado.` 
                });
            }
        }
        
        const casoAtualizado = casosRepository.update(id, dadosValidados);
        res.status(200).json(casoAtualizado);
        
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Payload inválido.",
                errors: error.errors.map(e => ({ 
                    field: e.path.join('.'), 
                    message: e.message 
                }))
            });
        }
        next(error);
    }
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