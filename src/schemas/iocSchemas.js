// Contenido para src/schemas/iocSchemas.js

const createIocSchema = {
  body: {
    type: 'object',
    required: ['value', 'type', 'source_name'],
    properties: {
      value: { 
        type: 'string', 
        minLength: 1,
        description: 'El valor literal del Indicador de Compromiso.'
      },
      type: { 
        type: 'string', 
        enum: ['ipv4', 'ipv6', 'domain', 'url', 'md5', 'sha1', 'sha256', 'email_address', 'filename'],
        description: 'El tipo de Indicador de Compromiso.'
      },
      source_name: { 
        type: 'string',
        description: 'Nombre de la fuente OSINT que reporta el IOC.'
      },
      source_url: { 
        type: 'string', 
        format: 'url', 
        nullable: true, // Puede ser null o no estar presente
        description: 'URL opcional de la fuente o del reporte específico.' 
      },
      reported_at_source: { 
        type: 'string', 
        format: 'date-time', 
        nullable: true,
        description: 'Fecha opcional en que la fuente reportó el IOC.'
      },
      tags: { 
        type: 'array', 
        items: { type: 'string' }, 
        nullable: true,
        description: 'Array opcional de etiquetas para categorizar el IOC.'
      },
      description: { 
        type: 'string', 
        nullable: true,
        description: 'Descripción textual opcional o contexto adicional sobre el IOC.'
      }
    },
    additionalProperties: false // No se permiten propiedades adicionales no definidas en el esquema
  }
  // Podrías añadir un esquema para la respuesta aquí si es necesario:
};

// Puedes exportar más esquemas aquí si los tienes para otras rutas
module.exports = {
  createIocSchema,
};