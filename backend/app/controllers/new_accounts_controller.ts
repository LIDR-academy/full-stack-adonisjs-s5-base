import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { signupValidator } from '#validators/auth'
import { UserTransformer } from '#transformers/user_transformer'

export default class NewAccountsController {
  /**
   * @store
   * POST /account/register — Crea una cuenta nueva y devuelve el usuario + un access token.
   * @summary Registrar una cuenta nueva
   * @description Valida el payload con VineJS (signupValidator), crea el usuario y emite un access token oat_*. El email debe ser único.
   * @requestBody <signupValidator>
   * @responseBody 201 - <User> - Cuenta creada. La respuesta real es { user, token }, donde token es el access token oat_* (se muestra una sola vez).
   * @responseBody 422 - {"errors": [{"message": "El email ya está registrado", "rule": "database.unique", "field": "email"}]} - Error de validación (email inválido o duplicado, password de menos de 8 caracteres, fullName fuera de rango).
   */
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(signupValidator)

    const user = await User.create(data)
    const token = await User.accessTokens.create(user)

    return response.created({
      user: UserTransformer.toJSON(user),
      token: token.value!.release(),
    })
  }
}
