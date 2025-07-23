const { randomUUID } = require('crypto');

// Simula nosso banco de dados de casos
const casos = [
    {
        id: "f5fb2ad5-22a8-4cb4-90f2-8733517a0d46",
        titulo: "Roubo a banco",
        descricao: "Assalto a mão armada na agência central do Banco do Brasil.",
        status: "solucionado",
        agente_id: "401bccf5-cf9e-489d-8412-446cd169a0f1"
    },
    {
        id: "b1c8e2b7-8d3c-4a4a-9b7e-4a6c8d7e9f1a",
        titulo: "Homicídio no centro",
        descricao: "Disparos foram reportados às 22:33 do dia 10/07/2024 na região do bairro União.",
        status: "aberto",
        agente_id: "a2a7c368-2a62-4407-b08e-539e31554a93"
    }
];

function findAll() {
    return casos;
}

function findById(id) {
    return casos.find(caso => caso.id === id);
}

function create(casoData) {
    const novoCaso = {
        id: randomUUID(),
        ...casoData
    };
    casos.push(novoCaso);
    return novoCaso;
}

function update(id, casoData) {
    const index = casos.findIndex(caso => caso.id === id);
    if (index === -1) {
        return null;
    }
    const casoAtualizado = { ...casos[index], ...casoData };
    casos[index] = casoAtualizado;
    return casoAtualizado;
}

function remove(id) {
    const index = casos.findIndex(caso => caso.id === id);
    if (index === -1) {
        return false;
    }
    casos.splice(index, 1);
    return true;
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    remove
};