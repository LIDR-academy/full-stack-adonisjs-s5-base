import vine from '@vinejs/vine'

/**
 * Valida los query params de GET /api/v1/users/active.
 * - `since`: ventana en horas; opcional y acotada a un rango razonable.
 * - `page` / `limit`: paginación; opcionales con límites de seguridad.
 */
export const listActiveUsersValidator = vine.compile(
  vine.object({
    since: vine.number().min(1).max(168).optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
  })
)
