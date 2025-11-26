# Usa una imagen base oficial de Node.js. Elige una versión LTS.
FROM node:18-alpine
# O considera node:20-alpine si prefieres la última LTS

# Crea el directorio de la aplicación dentro del contenedor
WORKDIR /usr/src/app

# Copia package.json y package-lock.json (si existe)
# Esto se hace antes de copiar todo el código para aprovechar el cache de Docker
# si las dependencias no han cambiado.
COPY package*.json ./

# Instala las dependencias de la aplicación
RUN npm install
# Para un entorno de producción, podrías considerar:
# RUN npm ci --only=production

# Copia el resto del código de la aplicación al directorio de trabajo
COPY . .

# Expone el puerto en el que la aplicación se ejecutará dentro del contenedor
EXPOSE 3000

# Define el comando para ejecutar la aplicación cuando se inicie el contenedor
# Usaremos el script "dev" de nuestro package.json para que nodemon funcione con los cambios en caliente
CMD [ "npm", "run", "dev" ]
# Para producción, probablemente usarías: CMD [ "npm", "run", "start" ]
