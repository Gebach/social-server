import { Router } from 'express'
import userContoller from '../controllers/userContoller.js'
import authRoutes from './auth.routes.js'
import userRoutes from './user.routes.js'
import noAuthMiddlewareRoutes from './noAuthMiddleware.routes.js'

const router = new Router()

router.use(authRoutes)
router.use(noAuthMiddlewareRoutes)

//authMiddleware
router.use(userRoutes)

export default router
