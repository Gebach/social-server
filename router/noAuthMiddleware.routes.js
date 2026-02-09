import { Router } from 'express'
import userContoller from '../controllers/userContoller.js'

const router = new Router()

router.get('/verify/:activationLink', userContoller.activateProfile)
router.get('/user/:uid', userContoller.getUser)
router.get('/users', userContoller.getUsers)

export default router
