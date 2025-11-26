const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const randomstring = require('randomstring');
const nodemailer = require('nodemailer');
const { Usuario, PasswordReset } = require('../config/mongodb');

// Configuración del transporter para enviar emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Tu email de Gmail
        pass: process.env.EMAIL_PASS  // Tu contraseña de Gmail
    }
});

// Registro de usuario
exports.register = async (req, res) => {
    try {
        const { email, password, nombre, apellido } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await Usuario.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear nuevo usuario
        const usuario = new Usuario({
            email,
            password: hashedPassword,
            nombre,
            apellido
        });

        await usuario.save();

        // Generar token de autenticación
        const token = jwt.sign(
            { userId: usuario._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            usuario: {
                _id: usuario._id,
                email: usuario.email,
                nombre: usuario.nombre,
                apellido: usuario.apellido
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(401).json({ message: 'Email o contraseña incorrectos' });
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, usuario.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Email o contraseña incorrectos' });
        }

        // Generar token de autenticación
        const token = jwt.sign(
            { userId: usuario._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            usuario: {
                _id: usuario._id,
                email: usuario.email,
                nombre: usuario.nombre,
                apellido: usuario.apellido
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
};

// Solicitar reset de contraseña
exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        // Buscar usuario
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(404).json({ message: 'Email no encontrado' });
        }

        // Generar token de reset
        const resetToken = randomstring.generate(32);
        const resetExpires = Date.now() + 3600000; // 1 hora

        // Crear registro de reset
        const passwordReset = new PasswordReset({
            email,
            token: resetToken,
            expiresAt: resetExpires
        });

        await passwordReset.save();

        // Enviar email con el token
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Solicitud de reset de contraseña',
            html: `
                <h2>Restablecimiento de contraseña</h2>
                <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
                <p>Este enlace expirará en 1 hora.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'Se ha enviado un email con instrucciones para restablecer tu contraseña' });
    } catch (error) {
        res.status(500).json({ message: 'Error al solicitar reset de contraseña', error: error.message });
    }
};

// Reset de contraseña
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Buscar registro de reset
        const passwordReset = await PasswordReset.findOne({ token });
        if (!passwordReset) {
            return res.status(404).json({ message: 'Token de reset inválido' });
        }

        // Verificar si el token ha expirado
        if (Date.now() > passwordReset.expiresAt) {
            return res.status(400).json({ message: 'Token de reset ha expirado' });
        }

        // Buscar usuario
        const usuario = await Usuario.findOne({ email: passwordReset.email });
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Hashear nueva contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        usuario.password = hashedPassword;
        await usuario.save();

        // Marcar el token como usado
        passwordReset.usado = true;
        await passwordReset.save();

        res.json({ message: 'Contraseña restablecida exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al restablecer contraseña', error: error.message });
    }
};
