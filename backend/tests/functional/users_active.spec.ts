import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'

test.group('GET /api/v1/users/active', (group) => {
  // Cada test corre dentro de una transacción que se revierte al terminar.
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  /**
   * Crea un usuario y devuelve un access token válido para autenticar
   * las peticiones a las rutas protegidas.
   */
  async function createAuthedUser() {
    const user = await User.create({
      fullName: 'Requester',
      email: 'requester@example.com',
      password: 'secret123',
    })
    user.lastSeenAt = DateTime.now()
    await user.save()

    const token = await User.accessTokens.create(user)
    return { user, token: token.value!.release() }
  }

  test('devuelve solo los usuarios vistos dentro de la ventana', async ({ client, assert }) => {
    const { token } = await createAuthedUser()

    const activo = await User.create({
      fullName: 'Activo',
      email: 'activo@example.com',
      password: 'secret123',
    })
    activo.lastSeenAt = DateTime.now().minus({ hours: 2 })
    await activo.save()

    const inactivo = await User.create({
      fullName: 'Inactivo',
      email: 'inactivo@example.com',
      password: 'secret123',
    })
    inactivo.lastSeenAt = DateTime.now().minus({ hours: 48 })
    await inactivo.save()

    const response = await client
      .get('/api/v1/users/active')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    const emails = response.body().users.map((u: { email: string }) => u.email)
    assert.include(emails, 'activo@example.com')
    assert.notInclude(emails, 'inactivo@example.com')
  })

  test('rechaza un `since` inválido con 422', async ({ client }) => {
    const { token } = await createAuthedUser()

    const response = await client
      .get('/api/v1/users/active?since=-5')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(422)
  })

  test('exige autenticación', async ({ client }) => {
    const response = await client.get('/api/v1/users/active')
    response.assertStatus(401)
  })
})
