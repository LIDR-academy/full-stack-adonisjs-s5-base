import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import User from '#models/user'
import { UserTransformer } from '#transformers/user_transformer'
import { listActiveUsersValidator } from '#validators/users'

/**
 * Ventana por defecto (en horas) para considerar a un usuario "activo".
 */
const ACTIVE_THRESHOLD_HOURS = 24
const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20

export default class UsersController {
  /**
   * GET /api/v1/users
   * Lista todos los usuarios. Requiere autenticación.
   */
  async index({ response }: HttpContext) {
    const users = await User.query().orderBy('created_at', 'desc')
    return response.ok({ users: UserTransformer.collection(users) })
  }

  /**
   * GET /api/v1/users/:id
   * Devuelve un usuario por id. Requiere autenticación.
   */
  async show({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    return response.ok({ user: UserTransformer.toJSON(user) })
  }

  /**
   * GET /api/v1/users/active
   * Lista los usuarios vistos recientemente (por defecto, últimas 24h).
   * El query param `since` (horas) permite ajustar la ventana.
   */
  async listActive({ request, response }: HttpContext) {
    // Validación del input con VineJS (sobre el query string).
    const { since, page, limit } = await request.validateUsing(listActiveUsersValidator, {
      data: request.qs(),
    })

    const hours = since ?? ACTIVE_THRESHOLD_HOURS
    const threshold = DateTime.now().minus({ hours })

    // Paginación obligatoria: evita devolver conjuntos potencialmente enormes.
    const users = await User.query()
      .where('last_seen_at', '>', threshold.toSQL()!)
      .orderBy('last_seen_at', 'desc')
      .paginate(page ?? DEFAULT_PAGE, limit ?? DEFAULT_LIMIT)

    // Manejo explícito del caso vacío: contrato de respuesta consistente.
    if (users.total === 0) {
      return response.ok({ users: [], meta: users.getMeta() })
    }

    return response.ok({
      users: UserTransformer.collection(users.all()),
      meta: users.getMeta(),
    })
  }
}
