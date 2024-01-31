import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { knex } from '../database'

export async function UsersRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const users = await knex('users').select('*')

    return reply.send({ users })
  })

  app.get('/:id', async (request, reply) => {
    const getTransactionsParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getTransactionsParamsSchema.parse(request.params)

    const user = await knex('users').select('*').where({ id }).first()

    return reply.send({ user })
  })

  app.post('/', async (request, reply) => {
    const createUserSchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(8),
    })

    const { name, email, password } = createUserSchema.parse(request.body)
    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      })
    }
    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      password,
      sessionId,
    })

    return reply.status(201).send()
  })

  app.get('/:id/summary', async (request, reply) => {
    const getTransactionsParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getTransactionsParamsSchema.parse(request.params)

    const validMeals = await knex('meals')
      .select('*')
      .where({ userId: id })
      .andWhere({ valid: true })

    const invalidMeals = await knex('meals')
      .select('*')
      .where({ userId: id })
      .andWhere({ valid: false })

    return reply.send({
      amountMeals: validMeals.length + invalidMeals.length,
      amountValidMeals: validMeals.length,
      amountInvalidMeals: invalidMeals.length,
      bestSequence: validMeals.length,
    })
  })
}
