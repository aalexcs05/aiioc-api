// src/controllers/iocController.js
const createIocService = require('../services/iocService');
const createScoringService = require('../services/scoringService');

module.exports = function(db) {
  const iocService = createIocService(db);
  const scoringService = createScoringService();

  return {
    async createIoc(request, reply) {
      // LOG 1: ¿Llega la petición al controlador?
      console.log('--- LOG 1: Controlador createIoc INICIADO ---');
      console.log('Request Body Recibido:', JSON.stringify(request.body, null, 2));

      try {
        const iocDataFromRequest = request.body;
        const createdOrUpdatedIoc = await iocService.createOrUpdateIocWithScoring(iocDataFromRequest, scoringService);
        
        // LOG 4: ¿Qué se va a enviar como respuesta?
        console.log('--- LOG 4: Controlador createIoc FINALIZADO con ÉXITO ---');
        console.log('Enviando respuesta:', JSON.stringify(createdOrUpdatedIoc, null, 2));
        
        reply.code(201).send(createdOrUpdatedIoc);
      } catch (error) {
        // LOG 5: ¿Ha ocurrido un error?
        console.error('--- LOG 5: ERROR en el controlador createIoc ---', error);
        throw error; // Pasa el error al manejador global de Fastify
      }
    },

    async getIocs(request, reply) {
      try {
        const result = await iocService.getIocs(request.query);
        reply.send(result);
      } catch (error) {
        throw error;
      }
    }
  };
};