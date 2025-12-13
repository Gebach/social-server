import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import errorMiddleware from './middlewares/errorMiddleware.js'
import router from './router/index.js'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

const PORT = process.env.PORT || 3000

const app = express()
app.use(express.json())
app.use(
  cors({
    credentials: true,
    origin: process.env.HOST_URL,
  })
)
app.use(cookieParser())
app.use('/api', router)
app.use(errorMiddleware)

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL)
    app.listen(PORT, () => console.log(`server is running on port ${PORT}`))
  } catch (error) {
    console.log(error)
  }
}

start()
