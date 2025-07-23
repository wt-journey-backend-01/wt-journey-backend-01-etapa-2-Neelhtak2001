const { randomUUID } = require('crypto'); // Importa a função para gerar UUIDs

// Simula nosso banco de dados em memória
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
function findAll() {
    return agentes;
}

// Função para encontrar um agente por ID
function findById(id) {
    return agentes.find(agente => agente.id === id);
}

// Função para criar um novo agente
function create(agenteData) {
    const novoAgente = {
        id: randomUUID(), // Gera um novo ID único
        ...agenteData
    };
    agentes.push(novoAgente);
    return novoAgente;
}

// Função para atualizar um agente (PUT/PATCH)
function update(id, agenteData) {
    const index = agentes.findIndex(agente => agente.id === id);
    if (index === -1) {
        return null; // Agente não encontrado
    }
    // Mescla os dados antigos com os novos
    const agenteAtualizado = { ...agentes[index], ...agenteData };
    agentes[index] = agenteAtualizado;
    return agenteAtualizado;
}

// Função para deletar um agente
function remove(id) {
    const index = agentes.findIndex(agente => agente.id === id);
    if (index === -1) {
        return false; // Não encontrou, não deletou
    }
    agentes.splice(index, 1);
    return true; // Deletou com sucesso
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    remove
};