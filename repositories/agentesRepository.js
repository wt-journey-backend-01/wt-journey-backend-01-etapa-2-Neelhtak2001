// repositories/agentesRepository.js

const { randomUUID } = require('crypto'); // Para gerar IDs únicos (UUIDs)
const agentes = [
  {
    id: "401bccf5-cf9e-489d-8412-446cd169a0f1",
    nome: "Rommel Carneiro",
    dataDeIncorporacao: "1992-10-04",
    cargo: "delegado"
  }
];

// Retorna todos os agentes do array
function findAll(options = {}) {
  //deixei a ordenação aqui...
     let agentesFiltrados = [...agentes];

    const { sort } = options;

    if (sort === 'dataDeIncorporacao') {
        agentesFiltrados.sort((a, b) => new Date(a.dataDeIncorporacao) - new Date(b.dataDeIncorporacao));
    } else if (sort === '-dataDeIncorporacao') {
        agentesFiltrados.sort((a, b) => new Date(b.dataDeIncorporacao) - new Date(a.dataDeIncorporacao));
    }

    return agentesFiltrados;
}

// Retorna um agente específico pelo ID
function findById(id) {
    return agentes.find(agente => agente.id === id);
}

// Cria um novo agente, gera um UUID e o adiciona no array
function create(agenteData) {
    const novoAgente = {
        id: randomUUID(),
        ...agenteData
    };
    agentes.push(novoAgente);
    return novoAgente;
}

// Atualiza um agente existente no array
function update(id, agenteData) {
    const index = agentes.findIndex(agente => agente.id === id);
    if (index === -1) {
        return null; // Retorna null se não encontrar o agente
    }
    const agenteAtualizado = { ...agentes[index], ...agenteData };
    agentes[index] = agenteAtualizado;
    return agenteAtualizado;
}

// Remove um agente do array
function remove(id) {
    const index = agentes.findIndex(agente => agente.id === id);
    if (index === -1) {
        return false; // Retorna false se não encontrou
    }
    agentes.splice(index, 1);
    return true; // Retorna true se conseguiu remover
}

// Exporta as funções corretas
module.exports = {
    findAll,
    findById,
    create,
    update,
    remove
};