---
name: review-pr
description: Ejecuta una review automatizada del diff actual contra origin/main. Úsala cuando el usuario diga "revisa la PR", "review del diff", "code review", o similar.
disable-model-invocation: false
allowed-tools: [Task, Read, Bash]
---

Cuando se invoque esta skill:

1. Verifica que hay cambios sin mergear: ejecuta `git diff origin/main...HEAD --stat`.
   Si está vacío, indica que no hay cambios que revisar y termina.
2. Invoca al subagent `code-reviewer` (definido en `.claude/agents/code-reviewer.md`)
   pasándole como tarea: "Revisa todos los archivos modificados en el diff actual
   contra origin/main siguiendo las convenciones de AGENTS.md".
3. Espera el informe del subagent.
4. Presenta el informe al usuario con un resumen ejecutivo de 1 párrafo al inicio,
   seguido del detalle por severidad que devolvió el subagent.
5. NO ejecutes acciones correctivas. Solo presentas hallazgos; el humano decide qué arreglar.
