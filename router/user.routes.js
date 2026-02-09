import { Router } from 'express'
import userContoller from '../controllers/userContoller.js'
import authMiddleware from '../middlewares/authMiddleware.js'
import multer from 'multer'

const router = new Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.')[1])
  },
})
const upload = multer({ storage })

router.use(authMiddleware)

router.post('/changeUserData', userContoller.changeUserData)
router.post('/changeUserPassword', userContoller.changeUserPassword)
router.post('/uploadProfileImage', upload.single('avatar'), userContoller.uploadProfileImage)
router.post('/verifyProfile', userContoller.verifyProfile)
router.post('/addFriend/:friendID', userContoller.addFriend)
router.post('/acceptFriend', userContoller.acceptFriend)
router.post('/deleteFriend', userContoller.deleteFriend)
router.post('/cancelFriendRequest', userContoller.cancelFriendRequest)

router.get('/friends/:userId', userContoller.getFriends)

export default router
