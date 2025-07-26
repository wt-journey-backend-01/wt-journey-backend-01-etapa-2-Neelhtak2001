const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0', // Especificação OpenAPI usada
  info: {
    title: 'API do Departamento de Polícia',
    version: '1.0.0',
    description: 'Documentação da API para gerenciamento de agentes e casos policiais.',
    contact: {
      name: 'Equipe de TI da Polícia',
      email: 'ti@policia.gov'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de Desenvolvimento'
    }
  ],
  // Define os "modelos" de dados que sua API usa
  components: {
    schemas: {
      Agente: {
        type: 'object',
        required: ['nome', 'dataDeIncorporacao', 'cargo'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'ID único do agente (gerado automaticamente)',
            example: '401bccf5-cf9e-489d-8412-446cd169a0f1'
          },
          nome: {
            type: 'string',
            description: 'Nome completo do agente',
            example: 'Rommel Carneiro'
          },
          dataDeIncorporacao: {
            type: 'string',
            format: 'date',
            description: 'Data em que o agente entrou na corporação (formato YYYY-MM-DD)',
            example: '1992-10-04'
          },
          cargo: {
            type: 'string',
            description: 'Cargo do agente (ex: delegado, inspetor)',
            example: 'delegado'
          }
        }
      },
      Caso: {
        type: 'object',
        required: ['titulo', 'descricao', 'status', 'agente_id'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'ID único do caso (gerado automaticamente)',
            example: 'f5fb2ad5-22a8-4cb4-90f2-8733517a0d46'
          },
          titulo: {
            type: 'string',
            description: 'Título breve do caso',
            example: 'Homicídio no centro'
          },
          descricao: {
            type: 'string',
            description: 'Descrição detalhada do caso',
            example: 'Disparos foram reportados às 22:33 do dia 10/07/2024.'
          },
          status: {
            type: 'string',
            description: 'Status atual do caso',
            enum: ['aberto', 'solucionado'],
            example: 'aberto'
          },
          agente_id: {
            type: 'string',
            format: 'uuid',
            description: 'ID do agente responsável pelo caso',
            example: '401bccf5-cf9e-489d-8412-446cd169a0f1'
          }
        }
      }
    }
  }
};

// Opções para o swagger-jsdoc
const options = {
  swaggerDefinition,
  // Caminho para os arquivos que contêm os endpoints da API (nossas rotas)
  apis: ['./routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;