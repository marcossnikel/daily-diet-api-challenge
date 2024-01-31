import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session'

export const mealRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/', { preHandler: checkSessionIdExists }, async (request, reply) => {
    let session = request.cookies.sessionId

    const meal = await knex('meals').select('*').where({
      sessionId: session,
    })

    if (!session) {
      session = randomUUID()

      reply.setCookie('sessionId', session, {
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      })
    }

    return reply.send({ meal })
  })

  app.get(
    '/:id',
    { preHandler: checkSessionIdExists },
    async (request, reply) => {
      const getMealByIdParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getMealByIdParamsSchema.parse(request.params)

      const meal = await knex('meals').select('*').where({ userId: id })

      return reply.send({ meal })
    },
  )

  app.post('/', async (request, reply) => {
    const createMealSchema = z.object({
      name: z.string(),
      description: z.string(),
      valid: z.boolean(),
    })
    const createMealParamsSchema = z.object({
      userId: z.string().uuid(),
    })
    const userId = createMealParamsSchema.parse(request.params)
    const { name, description, valid } = createMealSchema.parse(request.body)

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      valid,
      userId,
    })

    return reply.status(201).send()
  })

  app.put('/:id', async (request, reply) => {
    const updateMealSchema = z.object({
      name: z.string(),
      description: z.string(),
      valid: z.boolean(),
    })
    const updateMealParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { name, description, valid } = updateMealSchema.parse(request.body)
    const { id } = updateMealParamsSchema.parse(request.params)

    await knex('meals').where({ id }).update({
      name,
      description,
      valid,
    })

    return reply.status(200).send()
  })

  app.delete('/:id', async (request, reply) => {
    const deleteMealParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = deleteMealParamsSchema.parse(request.params)

    await knex('meals').where({ id }).del()

    return reply.status(200).send()
  })
}
