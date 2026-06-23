import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { UserTransformer } from '#transformers/user_transformer'
import { DateTime } from 'luxon'

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
   * Lista los usuarios vistos en las últimas 24 horas.
   *
   * ⚠️ ESTA VERSIÓN ES EL OBJETO DE REVIEW DE LA DEMO 1.
   * Contiene 4 issues plantados a propósito (ver SETUP-DEMOS.md).
   * NO es código de referencia correcto.
   */
  async listActive({ request, response }: HttpContext) {
    // ISSUE 1 (crítico): el query param `since` no se valida con VineJS.
    // Se lee directamente de la request sin sanitizar ni acotar.
    const since = request.input('since', 24)

    // ISSUE 3 (medio): magic number 24 sin constante con nombre.
    const threshold = DateTime.now().minus({ hours: since })

    // ISSUE 2 (crítico): query sin paginación. Puede devolver miles de filas.
    const users = await User.query()
      .where('last_seen_at', '>', threshold.toSQL()!)
      .orderBy('last_seen_at', 'desc')

    // ISSUE 4 (menor): no hay manejo explícito del caso "lista vacía"
    // (no es un bug grave, pero el contrato de respuesta es inconsistente
    // con el resto de endpoints).
    return response.ok({ users: UserTransformer.collection(users) })
  }
}
