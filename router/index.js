import { Router } from 'express'
import userContoller from '../controllers/userContoller.js'

const router = new Router()

router.post('/registration', userContoller.registration)
router.post('/login', userContoller.login)
router.post('/logout', userContoller.logout)
router.get('/users', userContoller.getUsers)

export default router
