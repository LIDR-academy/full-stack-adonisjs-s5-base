import type { HttpContext } from '@adonisjs/core/http'
import { UserTransformer } from '#transformers/user_transformer'

export default class ProfilesController {
  /**
   * @show
   * GET /account/profile — Devuelve el usuario autenticado. Requiere Bearer token.
   * @summary Perfil del usuario autenticado
   * @description Devuelve el usuario asociado al access token de la petición. Requiere Bearer token.
   * @responseBody 200 - <User> - Usuario autenticado (envuelto en { user }).
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]} - No autenticado (E_UNAUTHORIZED_ACCESS): token ausente o inválido.
   */
  async show({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    return response.ok({ user: UserTransformer.toJSON(user) })
  }
}
