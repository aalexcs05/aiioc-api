const fastify = require('fastify')();
const { register, login, requestPasswordReset, resetPassword } = require('../controllers/authController');

// Registro
fastify.post('/auth/register', async (req, reply) => {
    try {
        const result = await register(req, reply);
        reply.code(201).send(result);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
});

// Login
fastify.post('/auth/login', async (req, reply) => {
    try {
        const result = await login(req, reply);
        reply.send(result);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
});

// Solicitar reset de contraseña
fastify.post('/auth/password-reset', async (req, reply) => {
    try {
        const result = await requestPasswordReset(req, reply);
        reply.send(result);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
});

// Reset de contraseña
fastify.post('/auth/reset-password/:token', async (req, reply) => {
    try {
        const result = await resetPassword(req, reply);
        reply.send(result);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
});

module.exports = fastify;
