import { Router } from 'express'
import userContoller from '../controllers/userContoller.js'
import authRoutes from './auth.routes.js'
import userRoutes from './user.routes.js'

const router = new Router()

router.use(authRoutes)
router.use(userRoutes)

router.get('/verify/:activationLink', userContoller.activateProfile)
router.get('/users', userContoller.getUsers)

export default router
