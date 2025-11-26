// src/services/iocService.js
module.exports = function(db) {
  const iocsCollection = db.collection('iocs');

  return {
    async createOrUpdateIocWithScoring(iocDataFromRequest, scoringService) {
      // LOG 2: ¿Llega la llamada al servicio?
      console.log('--- LOG 2: Servicio createOrUpdateIocWithScoring INICIADO ---');
      console.log('Datos recibidos en el servicio:', JSON.stringify(iocDataFromRequest, null, 2));
      
      if (!iocDataFromRequest || !iocDataFromRequest.value || !iocDataFromRequest.type) {
        throw new Error('Datos de IOC inválidos: value y type son requeridos.');
      }

      const filter = { 
        value: iocDataFromRequest.value, 
        type: iocDataFromRequest.type 
      };
      const existingIoc = await iocsCollection.findOne(filter);

      const calculatedScore = scoringService.calculateScore(iocDataFromRequest, existingIoc);

      const iocToPersist = {
        value: iocDataFromRequest.value,
        type: iocDataFromRequest.type,
        risk_score: calculatedScore,
        status: 'active',
        description: iocDataFromRequest.description || (existingIoc ? existingIoc.description : null),
        first_seen: existingIoc?.first_seen || iocDataFromRequest.first_seen || new Date(),
        last_seen: new Date(),
        updatedAt: new Date(),
        sources: existingIoc?.sources || []
      };
      
      // Añadir el source_name al array de sources si no existe
      if (iocDataFromRequest.source_name) {
        const sourceExists = iocToPersist.sources.some(source => source.name === iocDataFromRequest.source_name);
        if (!sourceExists) {
          iocToPersist.sources.push({ name: iocDataFromRequest.source_name });
        }
      }
      
      const updateOperation = {
        $set: iocToPersist,
        $setOnInsert: { createdAt: new Date() },
        $addToSet: { 
          tags: { $each: iocDataFromRequest.tags || [] } 
        }
      };
      
      const options = { 
        upsert: true,
        returnDocument: 'after'
      };

      try {
        const result = await iocsCollection.findOneAndUpdate(filter, updateOperation, options);
        
        // LOG 3: ¿Qué ha devuelto la base de datos?
        console.log('--- LOG 3: Resultado de findOneAndUpdate en BBDD ---');
        console.log(JSON.stringify(result, null, 2));

        return result.value || result;
      } catch (dbError) {
        console.error("--- ERROR en findOneAndUpdate ---", dbError);
        throw new Error('Error de base de datos al crear/actualizar IOC.');
      }
    },
    
    async getIocs(queryParams) {
      const query = {};
      if (queryParams.type) {
        query.type = queryParams.type;
      }
      
      // Manejar el filtro por fuente
      if (queryParams.source_name) {
        query.sources = { $elemMatch: { name: queryParams.source_name } };
      }
      
      // Manejar ambos filtros de puntuación
      if (queryParams.risk_score_gte || queryParams.risk_score_lte) {
        query.risk_score = {};
        if (queryParams.risk_score_gte) {
          query.risk_score.$gte = parseInt(queryParams.risk_score_gte, 10);
        }
        if (queryParams.risk_score_lte) {
          query.risk_score.$lte = parseInt(queryParams.risk_score_lte, 10);
        }
      }
      
      const sortOptions = {};
      if (queryParams.sortBy && queryParams.sortOrder) {
        sortOptions[queryParams.sortBy] = queryParams.sortOrder === 'desc' ? -1 : 1;
      } else {
        sortOptions.risk_score = -1;
      }
      
      const iocs = await iocsCollection.find(query).sort(sortOptions).limit(10000).toArray();
      const totalItems = await iocsCollection.countDocuments(query);
      
      return { 
        data: iocs, 
        pagination: { 
          totalItems: totalItems,
        } 
      };
    }
  };
};