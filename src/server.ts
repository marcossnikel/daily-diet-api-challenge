import { app } from '.'

app
  .listen({
    port: 3000,
  })
  .then((address) => {
    console.log(`server listening on port 3000`)
  })
