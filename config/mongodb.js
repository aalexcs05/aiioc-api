const mongoose = require('mongoose');

// Conexión a MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://mongo_db:27017/aiioc_database', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Conectado a MongoDB');
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error);
        process.exit(1);
    }
};

// Esquema de Usuario
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    nombre: {
        type: String,
        required: true
    },
    apellido: {
        type: String,
        required: true
    },
    fechaRegistro: {
        type: Date,
        default: Date.now
    },
    recordar: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

// Esquema de Registro de Acceso
const loginLogSchema = new mongoose.Schema({
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    ip: String,
    exito: {
        type: Boolean,
        required: true
    },
    mensaje: String
});

// Esquema de Reset de Contraseña
const passwordResetSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    token: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    usado: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Crear modelos
const Usuario = mongoose.model('Usuario', userSchema);
const LoginLog = mongoose.model('LoginLog', loginLogSchema);
const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = {
    connectDB,
    Usuario,
    LoginLog,
    PasswordReset
};
