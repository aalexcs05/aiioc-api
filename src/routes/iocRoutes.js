// src/routes/iocRoutes.js
const { createIocSchema } = require('../schemas/iocSchemas');
const createIocController = require('../controllers/iocController');

async function iocRoutes(fastify, options) {
  
  // 1. Obtener la conexión a la base de datos de la instancia de fastify
  const db = fastify.mongo.db();

  // 2. Crear una instancia del controlador, inyectándole la conexión a la BBDD.
  //    El controlador se encargará de crear sus propios servicios.
  const iocController = createIocController(db);

  // --- DEFINICIÓN DE RUTAS ---
  // Las rutas ahora solo llaman a los métodos del controlador.

  // Ruta POST para crear o actualizar un IOC
  fastify.post('/', { schema: createIocSchema }, iocController.createIoc);

  // Ruta GET para listar IOCs con filtros y paginación
  fastify.get('/', iocController.getIocs); // <--- SOLO HAY UNA DEFINICIÓN DE GET '/' AQUÍ

  // --- PLACEHOLDERS PARA FUTURAS RUTAS ---
  
  // fastify.get('/:id', { schema: getIocByIdSchema }, iocController.getIocById);
  // fastify.put('/:id', { schema: updateIocSchema }, iocController.updateIoc);
  // fastify.delete('/:id', { schema: deleteIocSchema }, iocController.deleteIoc);
}

module.exports = iocRoutes; // Exporta la función del plugin directamente