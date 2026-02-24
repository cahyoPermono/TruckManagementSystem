import { buildApp } from './app'
import * as dotenv from 'dotenv'

dotenv.config()

const start = async () => {
  try {
    const app = await buildApp()
    const port = parseInt(process.env.PORT || '4000', 10)
    
    await app.listen({ port, host: '0.0.0.0' })
    console.log(`Server is running at http://localhost:${port}`)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()
