import type { HttpContext } from '@adonisjs/core/http'

export default class HealthController {
  /**
   * @index
   * GET /api/v1/health — Endpoint de liveness. Creado en la Sesión 2 mediante el flujo OpenSpec.
   * @summary Liveness check
   * @description Endpoint público de liveness. No requiere autenticación.
   * @responseBody 200 - {"status": "ok"} - El servicio está operativo.
   */
  async index({ response }: HttpContext) {
    return response.ok({ status: 'ok' })
  }
}
