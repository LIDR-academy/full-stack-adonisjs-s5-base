import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { UserTransformer } from '#transformers/user_transformer'

export default class UsersController {
  /**
   * @index
   * GET /api/v1/users — Lista todos los usuarios. Requiere autenticación.
   * @summary Listar usuarios
   * @description Devuelve todos los usuarios ordenados por fecha de creación descendente. Requiere Bearer token.
   * @responseBody 200 - <User[]> - Lista de usuarios (envuelta en { users }).
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]} - No autenticado (E_UNAUTHORIZED_ACCESS): token ausente o inválido.
   */
  async index({ response }: HttpContext) {
    const users = await User.query().orderBy('created_at', 'desc')
    return response.ok({ users: UserTransformer.collection(users) })
  }

  /**
   * @show
   * GET /api/v1/users/:id — Devuelve un usuario por id. Requiere autenticación.
   * @summary Obtener usuario por id
   * @description Devuelve un usuario por su id. Requiere Bearer token.
   * @paramPath id - Id numérico del usuario - @type(number) @required
   * @responseBody 200 - <User> - Usuario encontrado (envuelto en { user }).
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]} - No autenticado (E_UNAUTHORIZED_ACCESS): token ausente o inválido.
   * @responseBody 404 - {"errors": [{"message": "Row not found"}]} - Usuario no encontrado (E_ROW_NOT_FOUND).
   */
  async show({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    return response.ok({ user: UserTransformer.toJSON(user) })
  }

  /*
  |----------------------------------------------------------------------
  | NOTA PARA EL FORMADOR:
  | El endpoint GET /api/v1/users/active (usuarios vistos en las
  | últimas 24h) se implementa EN VIVO durante la demo de la Sesión 3
  | aplicando el flujo Explore-Plan-Execute. No lo pre-implementes aquí.
  |----------------------------------------------------------------------
  */
}
