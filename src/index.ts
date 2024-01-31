import fastify from 'fastify'
import { UsersRoutes } from './routes/users'
import cookie from '@fastify/cookie'
import { mealRoutes } from './routes/meal'
export const app = fastify()

app.register(cookie)
app.register(mealRoutes, { prefix: '/meal' })
app.register(UsersRoutes, { prefix: '/users' })
