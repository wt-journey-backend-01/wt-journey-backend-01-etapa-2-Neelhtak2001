// repositories/casosRepository.js

const { randomUUID } = require('crypto');

const casos = [
    {
        id: "f5fb2ad5-22a8-4cb4-90f2-8733517a0d46",
        titulo: "Roubo a banco",
        descricao: "Assalto a mão armada na agência central do Banco do Brasil.",
        status: "solucionado",
        agente_id: "401bccf5-cf9e-489d-8412-446cd169a0f1"
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