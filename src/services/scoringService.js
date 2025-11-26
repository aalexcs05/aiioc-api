// src/services/scoringService.js

function createScoringService() {
  // --- CONFIGURACIÓN DE PUNTUACIONES ---
  const sourceReliability = {
    'URLhaus (abuse.ch)': 35, // Fuente de muy alta fiabilidad
    'FireHOL Level 1': 20,
    'GitHub Phishing URLs (chamanthmvs)': 25,
    'AlienVault OTX': 30,
    'VirusTotal': 28,
    'default': 8
  };

  const typeSeverity = {
    'url': 20,
    'domain': 18,
    'md5': 30, 'sha1': 30, 'sha256': 30, // Hashes son más críticos
    'ipv4': 15, 'ipv6': 15,
    'email': 12,
    'default': 5
  };

  const tagSeverity = {
    'malware': 40,
    'phishing': 35,
    'c2': 45, // Command & Control es muy crítico
    'botnet': 35,
    'ransomware': 50, // Ransomware es extremadamente crítico
    'trojan': 38,
    'exploit': 42,
    'apt': 45, // Advanced Persistent Threat
    'spam': 15,
    'suspicious': 10
  };

  return {
    /**
     * Calcula la puntuación de riesgo para un IOC.
     * @param {object} newIocData - Los datos del IOC que llegan desde la fuente (ej. de n8n).
     * @param {object|null} existingIoc - El documento del IOC si ya existe en la BBDD.
     * @returns {number} La puntuación de riesgo calculada (0-100).
     */
    calculateScore: (newIocData, existingIoc = null) => {
      let score = 10; // Puntuación base por ser reportado

      // 1. Puntuación por Fiabilidad de la Fuente
      if (newIocData.source_name && sourceReliability[newIocData.source_name]) {
        score += sourceReliability[newIocData.source_name];
      } else {
        score += sourceReliability['default'];
      }

      // 2. Puntuación por Tipo de IOC
      if (newIocData.type && typeSeverity[newIocData.type]) {
        score += typeSeverity[newIocData.type];
      } else {
        score += typeSeverity['default'];
      }

      // 3. Puntuación por Tags de Alto Riesgo
      if (newIocData.tags && Array.isArray(newIocData.tags)) {
        newIocData.tags.forEach(tag => {
          const lowerCaseTag = tag.toLowerCase();
          if (tagSeverity[lowerCaseTag]) {
            score += tagSeverity[lowerCaseTag];
          }
        });
      }

      // 4. Penalización por Antigüedad del IOC
      // La referencia para la fecha es la del IOC existente si lo hay, si no, la del nuevo.
      // Si no hay ninguna fecha, no se aplica penalización.
      const referenceDate = existingIoc?.first_seen || newIocData.first_seen;
      if (referenceDate) {
        try {
          const firstSeenDate = new Date(referenceDate);
          const today = new Date();
          const diffTime = Math.abs(today - firstSeenDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays > 180) {
            score -= 30; // Penalización muy fuerte para IOCs muy antiguos
          } else if (diffDays > 90) {
            score -= 20; // Penalización fuerte
          } else if (diffDays > 30) {
            score -= 10; // Penalización moderada
          } else if (diffDays <= 7) {
            score += 15; // Bonificación por IOC muy reciente (última semana)
          } else if (diffDays <= 14) {
            score += 8; // Bonificación por IOC reciente (últimas 2 semanas)
          }
        } catch (error) {
          console.error('Error al calcular la antigüedad del IOC:', error);
          // No se detiene el proceso, simplemente no se aplica la penalización por antigüedad
        }
      }

      // 5. Bonificación por Corroboración por Múltiples Fuentes
      if (existingIoc && existingIoc.sources && Array.isArray(existingIoc.sources)) {
        const uniqueSourceNames = new Set(existingIoc.sources.map(s => s.name));
        
        // Solo se añade la bonificación si la fuente actual es NUEVA para este IOC
        if (!uniqueSourceNames.has(newIocData.source_name)) {
          // La bonificación se basa en cuántas fuentes *ya lo habían reportado antes*
          score += uniqueSourceNames.size * 15; // +15 por cada fuente previa (corroboración múltiple)
        }
      }

      // 6. Normalizar puntuación para que esté en el rango 0-100
      return Math.min(100, Math.max(0, score));
    }
  };
}

module.exports = createScoringService;