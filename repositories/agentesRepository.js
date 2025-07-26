//est arquivo é responsavel por gerenciar os dados dos agentes da polícia
// e simula um banco de dados em memória

const { randomUUID } = require('crypto'); // Importa a função para gerar UUIDs


const agentes = [
  {
    id: "401bccf5-cf9e-489d-8412-446cd169a0f1",
    nome: "Rommel Carneiro",
    dataDeIncorporacao: "1992-10-04",
    cargo: "delegado"
  },
  {
    id: "a2a7c368-2a62-4407-b08e-539e31554a93",
    nome: "Ana Pereira",
    dataDeIncorporacao: "2015-03-12",
    cargo: "inspetor"
  }
];

// Função para listar todos os agentes
function listarAgentes(req, res) {
    const agentes = agentesRepository.findAll();
    res.status(200).json(agentes);
}

// Função para encontrar um agente por ID
function buscarAgentePorId(req, res) {
    const { id } = req.params;
    const agente = agentesRepository.findById(id);

    if (!agente) {
        return res.status(404).json({ message: 'Agente não encontrado.' });
    }

    res.status(200).json(agente);
}

// Função para criar um novo agente
function criarAgente(req, res) {
    const { nome, dataDeIncorporacao, cargo } = req.body;

    if (!nome || !dataDeIncorporacao || !cargo) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios: nome, dataDeIncorporacao, cargo.' });
    }

    const validacaoData = validarDataIncorporacao(dataDeIncorporacao);
    if (!validacaoData.valido) {
        return res.status(400).json({ message: validacaoData.message });
    }

    const novoAgente = agentesRepository.create({ nome, dataDeIncorporacao, cargo });
    res.status(201).json(novoAgente);
}

// Função para atualizar um agente (PUT/PATCH)
function atualizarAgente(req, res) {
    const { id } = req.params;
    const { nome, dataDeIncorporacao, cargo } = req.body;

    if ('id' in req.body) {
        return res.status(400).json({ message: 'Não é permitido alterar o ID do agente via payload.' });
    }

    if (!nome || !dataDeIncorporacao || !cargo) {
        return res.status(400).json({ message: 'Para atualização completa, todos os campos são obrigatórios: nome, dataDeIncorporacao, cargo.' });
    }
    
    const validacaoData = validarDataIncorporacao(dataDeIncorporacao);
    if (!validacaoData.valido) {
        return res.status(400).json({ message: validacaoData.message });
    }

    const agenteAtualizado = agentesRepository.update(id, { nome, dataDeIncorporacao, cargo });

    if (!agenteAtualizado) {
        return res.status(404).json({ message: 'Agente não encontrado.' });
    }

    res.status(200).json(agenteAtualizado);
}


// Função para deletar um agente
function deletarAgente(req, res) {
    const { id } = req.params;
    const sucesso = agentesRepository.remove(id);

    if (!sucesso) {
        return res.status(404).json({ message: 'Agente não encontrado.' });
    }

    res.status(204).send();
}

function validarDataIncorporacao(data) {
    // Regex para o formato YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(data)) {
        return { valido: false, message: "Formato da data deve ser YYYY-MM-DD." };
    }

    const dataObj = new Date(data);
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);


    // Verifica se a data é válida (ex: 2023-02-30 é inválido)
    if (isNaN(dataObj.getTime())) {
        return { valido: false, message: "Data inválida." };
    }

    // Verifica se a data não está no futuro
    if (dataObj > hoje) {
        return { valido: false, message: "A data de incorporação não pode ser no futuro." };
    }

    return { valido: true };
}

module.exports = {
    listarAgentes,
    buscarAgentePorId,
    criarAgente,
    atualizarAgente,
    deletarAgente
};