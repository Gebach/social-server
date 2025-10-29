import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import errorMiddleware from './middlewares/errorMiddleware.js'
import router from './router/index.js'

const PORT = process.env.PORT || 3000

const app = express()
app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use('/api', router)
app.use(errorMiddleware)

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL)
    app.listen(PORT, () => console.log(`server is running on port ${PORT}`))
  } catch (error) {
    console.log(error)
  }
}

start()
