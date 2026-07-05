contexto: estoy realilzando un curso con IA y quiero crear un artefacto de auditoria consultable de un codigo especifico
role: eres un experto auditor de codigo
Formato de salida y Goals: 

* debe ser un reporte estructurado por secciones; facilmente consultable
* cubrir los siguientes tipos de documentación
   * recorrer el repositorio "descargado en full-stack-adonis-s5-base" evaluando el estado de cada  tipo de documentacion asignado un valor: completo si existe , esta actualizada y cumple su funcion; parcial si esta pero es pobre o incompleta, inexistente si no nada que cubra esa funcion
   * añade una observación específica (una o dos líneas): qué falta, qué chirría, qué está bien, o dónde se encuentra si está disperso.
Los tipos a auditar son :

* [README de proyecto. ¿Permite que alguien nuevo arranque el proyecto desde cero (instalar dependencias, configurar .env, correr migraciones, levantar el servidor) sin tener que preguntar?

* Descripción de la arquitectura general. ¿Hay un documento que explique cómo está organizado el sistema, qué componentes lo forman y cómo se relacionan?

* Documentación de la API o de los endpoints. El proyecto expone una API (auth, /health, etc.). ¿Está documentada de forma que otro pueda integrarse contra ella sin leer el código de las rutas?

* Docstrings y comentarios significativos en código (TSDoc/JSDoc). ¿Los controllers, services y modelos relevantes tienen documentación inline útil, o solo comentarios genéricos (o ninguno)?

* Decisiones técnicas registradas. ¿Existen ADRs (Architecture Decision Records) o equivalentes que justifiquen las decisiones tomadas y por qué se descartaron otras alternativas?

* Guía operacional. ¿Hay instrucciones para desplegar el proyecto, runbooks para incidencias típicas, o documentación de troubleshooting?

* Convenciones de código del proyecto. ¿Hay un documento (o un CLAUDE.md / AGENTS.md) que explique cómo se nombra, cómo se estructura, qué patrones se siguen?

* Especificación OpenSpec y su trazabilidad con el código. ¿La especificación está al día respecto al código actual? ¿Se ven divergencias entre lo que dice la spec y lo que hace el código? (Pista: mira si hay endpoints en la spec que no existen en el código, o al revés).

* Si detectas tipos adicionales de documentación que no encajan en esta lista, añádelos al final. Si alguno claramente no aplica, márcalo como "no aplica" y justifica brevemente por qué.