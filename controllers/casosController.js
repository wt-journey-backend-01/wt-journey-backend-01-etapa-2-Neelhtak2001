// Controllers para gerenciar casos
//serve para: listar, buscar por id, criar, atualizar, atualizar parcialmente e deletar casos
// o arquvo contem as funções que manipulam as requisições HTTP e interagem com o repositório de casos

// controllers/casosController.js

const casosRepository = require('../repositories/casosRepository');
const agentesRepository = require('../repositories/agentesRepository');
const { z } = require('zod');

const criarCasoSchema = z.object({
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

const casoPatchSchema = criarCasoSchema.partial().strict({ message: "O corpo da requisição contém campos não permitidos." });

// GET /casos
function listarCasos(req, res) {
    const { status, agente_id, q } = req.query;
    
    // Validar parâmetros de query
    if (status && !['aberto', 'solucionado'].includes(status)) {
        return res.status(400).json({ 
            message: "Parâmetro 'status' inválido. Use 'aberto' ou 'solucionado'." 
        });
    }
    
    if (agente_id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(agente_id)) {
        return res.status(400).json({ 
            message: "Parâmetro 'agente_id' deve ser um UUID válido." 
        });
    }
    
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
function criarCaso(req, res) {
    console.log('POST /casos - Body recebido:', JSON.stringify(req.body, null, 2));
    
    // Verificar se o corpo da requisição está vazio
    if (!req.body || Object.keys(req.body).length === 0) {
        console.log('POST /casos - Corpo vazio detectado');
        return res.status(400).json({ message: "Corpo da requisição não pode ser vazio." });
    }

    try {
        console.log('POST /casos - Iniciando validação com Zod...');
        const dadosValidados = criarCasoSchema.parse(req.body);
        console.log('POST /casos - Dados validados:', dadosValidados);

        console.log('POST /casos - Verificando se agente existe...');
        const agenteExiste = agentesRepository.findById(dadosValidados.agente_id);
        console.log('POST /casos - Resultado da busca do agente:', agenteExiste ? 'Encontrado' : 'Não encontrado');
        
        if (!agenteExiste) {
            console.log('POST /casos - Retornando 404 para agente não encontrado');
            return res.status(404).json({ message: `Agente com id ${dadosValidados.agente_id} não encontrado.` });
        }

        const novoCaso = casosRepository.create(dadosValidados);
        console.log('POST /casos - Caso criado com sucesso:', novoCaso.id);
        res.status(201).json(novoCaso);

    } catch (error) {
        console.log('POST /casos - Erro capturado:', error.name, error.message);
        
        if (error instanceof z.ZodError) {
            console.log('POST /casos - Detalhes do erro Zod:', error.errors);
            return res.status(400).json({
                message: "Payload inválido.",
                errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
            });
        }
        console.error('Erro inesperado no POST /casos:', error);
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
}

// PUT /casos/:id (Atualização Completa)
function atualizarCaso(req, res) {
    const { id } = req.params;
    
    // Verificar se o corpo da requisição está vazio
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Corpo da requisição não pode ser vazio." });
    }
    
    if ('id' in req.body) {
        return res.status(400).json({ message: 'Não é permitido alterar o campo id.' });
    }

    try {
        const dadosValidados = criarCasoSchema.parse(req.body);

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
        console.error('Erro inesperado no PUT /casos:', error);
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
}

// PATCH /casos/:id (Atualização Parcial)
function atualizarParcialmenteCaso(req, res) {
    const { id } = req.params;
    
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
            if (!agenteExiste) {
                return res.status(404).json({ 
                    message: `Agente com id ${dadosValidados.agente_id} não encontrado.` 
                });
            }
        }
        
        const casoAtualizado = casosRepository.update(id, dadosValidados);
        if (!casoAtualizado) {
            return res.status(404).json({ message: 'Caso não encontrado.' });
        }
        
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
        console.error('Erro inesperado:', error);
        return res.status(500).json({ message: "Erro interno do servidor." });
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