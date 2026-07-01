import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator } from '#validators/auth'
import { UserTransformer } from '#transformers/user_transformer'

export default class AccessTokensController {
  /**
   * @store
   * POST /account/login — Verifica credenciales y emite un access token.
   * @summary Iniciar sesión
   * @description Verifica email + password con User.verifyCredentials, actualiza lastSeenAt y emite un nuevo access token oat_*.
   * @requestBody <loginValidator>
   * @responseBody 200 - <User> - Login correcto. La respuesta real es { user, token }, donde token es el access token oat_*.
   * @responseBody 400 - {"errors": [{"message": "Invalid user credentials"}]} - Credenciales inválidas (E_INVALID_CREDENTIALS): email o password incorrectos.
   * @responseBody 422 - {"errors": [{"message": "El email debe ser válido", "rule": "email", "field": "email"}]} - Error de validación del payload (email mal formado o campos ausentes).
   */
  async store({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(email, password)

    user.lastSeenAt = DateTime.now()
    await user.save()

    const token = await User.accessTokens.create(user)

    return response.ok({
      user: UserTransformer.toJSON(user),
      token: token.value!.release(),
    })
  }

  /**
   * @destroy
   * POST /account/logout — Revoca el token usado en la petición actual.
   * @summary Cerrar sesión
   * @description Revoca el access token con el que se autenticó la petición actual. Requiere Bearer token.
   * @responseBody 200 - {"revoked": true} - Token revocado correctamente.
   * @responseBody 401 - {"errors": [{"message": "Unauthorized access"}]} - No autenticado (E_UNAUTHORIZED_ACCESS): token ausente, inválido o ya revocado.
   */
  async destroy({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const token = user.currentAccessToken
    await User.accessTokens.delete(user, token.identifier)

    return response.ok({ revoked: true })
  }
}
