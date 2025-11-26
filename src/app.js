// src/app.js

// --- Importaciones de Módulos ---
const fastify = require('fastify')({ logger: true });
const { MongoClient } = require('mongodb');
const cors = require('@fastify/cors'); // Importamos el plugin de CORS
const fastifyStatic = require('@fastify/static');
const path = require('path');

// --- Importaciones Locales ---
const iocRoutes = require('./routes/iocRoutes');

// --- Constantes de Configuración ---
// Cargar variables de entorno desde .env si existe
// require('dotenv').config(); 
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo_db:27017/aiioc_database';
const PORT = process.env.PORT || 3000;


// --- REGISTRO DE PLUGINS Y HOOKS DE FASTIFY ---

// 1. Plugin de CORS (¡IMPORTANTE!)
// Se registra primero para que se aplique a todas las rutas.
fastify.register(cors, {
  origin: true, // Permite peticiones desde cualquier origen (para desarrollo)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Métodos HTTP permitidos
  credentials: true
});

// 2. Plugin de archivos estáticos para servir el frontend
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/', // Los archivos estarán disponibles en la raíz
});

// 3. Manejador de Errores Global (setErrorHandler)
// Este hook captura todos los errores que ocurren en la aplicación.
fastify.setErrorHandler(function (error, request, reply) {
  // Loguea el error para depuración interna
  fastify.log.error({
    msg: 'Error capturado por setErrorHandler',
    err: {
      message: error.message,
      stack: error.stack,
    },
    url: request.raw.url,
    method: request.method
  });

  // Si es un error de validación de Fastify, devuelve un 400 detallado.
  if (error.validation) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Error de validación de entrada.',
      validation: error.validation 
    });
  }

  // Si el error ya tiene un statusCode (lanzado por nosotros), lo respetamos.
  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.name || 'Error',
      message: error.message,
    });
  }
  
  // Para cualquier otro error inesperado, devuelve un 500 genérico.
  reply.status(500).send({
    statusCode: 500,
    error: 'Internal Server Error',
    message: 'Ha ocurrido un error inesperado en el servidor.'
  });
});


// --- FUNCIÓN PRINCIPAL DE ARRANQUE (start) ---
const start = async () => {
  try {
    // 1. Conectar a la base de datos y decorar la instancia de Fastify
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    fastify.decorate('mongo', client); // Ahora 'fastify.mongo' está disponible en toda la app
    fastify.log.info('Conectado exitosamente a MongoDB.');
    
    // 2. Registrar Rutas
    // Se registran después de los plugins y decoradores para que puedan usarlos.
    fastify.register(iocRoutes, { prefix: '/api/iocs' });
    
    // 3. Iniciar el servidor
    // '0.0.0.0' es crucial para que sea accesible desde fuera del contenedor Docker.
    await fastify.listen({ port: PORT, host: '0.0.0.0' });

    // Mensaje de éxito al arrancar (se mostrará después de los logs de fastify.listen)
    // fastify.log.info(`Servidor escuchando en el puerto ${PORT}`); // fastify.listen ya lo loguea

  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// --- Iniciar la Aplicación ---
start();