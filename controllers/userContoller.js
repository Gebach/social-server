import 'dotenv/config'
import userService from '../services/userService.js'
import emailService from '../services/emailService.js'

class UserContoller {
  async registration(req, res, next) {
    try {
      const { email, login, password } = req.body
      const data = await userService.registration(email, login, password)
      res.cookie('refreshToken', data.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })

      return res.json(data.userData)
    } catch (err) {
      next(err)
    }
  }

  async login(req, res, next) {
    try {
      const { login, password } = req.body
      const data = await userService.login(login, password)
      res.cookie('refreshToken', data.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })

      return res.json(data.userData)
    } catch (err) {
      next(err)
    }
  }

  async getUsers(req, res, next) {
    console.log(123)
    try {
      const users = await userService.getUsers()
      return res.json(users)
    } catch (err) {
      next(err)
    }
  }

  async getUser(req, res, next) {
    console.log(123)
    const { uid } = req.params
    console.log(33333)

    try {
      const userData = await userService.getUser(uid)
      console.log('GET USER', userData)
      return res.json(userData)
    } catch (err) {
      next(err)
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies
      const tokenData = await userService.logout(refreshToken)
      res.clearCookie()
      return res.json(tokenData)
    } catch (err) {
      next(err)
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies
      const data = await userService.refresh(refreshToken)
      res.cookie('refreshToken', data.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })

      return res.json(data.userData)
    } catch (err) {
      next(err)
    }
  }

  async changeUserData(req, res, next) {
    try {
      const { userData } = req.body
      const user = await userService.changeUserData(userData)

      return res.json(user)
    } catch (err) {
      next(err)
    }
  }

  async changeUserPassword(req, res, next) {
    try {
      const { oldPassword, newPassword, userID } = req.body
      const status = await userService.changeUserPassword(oldPassword, newPassword, userID)

      return res.json(status)
    } catch (err) {
      next(err)
    }
  }

  async uploadProfileImage(req, res, next) {
    const { userId } = req.body
    try {
      const imagePath = await userService.uploadProfileImage(
        `${process.env.ORIGIN_FILES_URL}/${req.file.filename}`,
        userId,
      )
      return res.json(imagePath)
    } catch (err) {
      next(err)
    }
  }

  async verifyProfile(req, res, next) {
    const { userID } = req.body
    try {
      const info = await emailService.verifyProfile(userID)

      return res.json(info)
    } catch (err) {
      next(err)
    }
  }

  async activateProfile(req, res, next) {
    const activationLink = req.params.activationLink

    try {
      const userData = await userService.activateProfile(activationLink)

      return res.redirect(`${process.env.HOST_URL}/profile/${userData.id}`)
    } catch (err) {
      next(err)
    }
  }

  async addFriend(req, res, next) {
    const { friendID } = req.params
    const userId = req.user.id
    try {
      const userData = await userService.addFriend(friendID, userId)

      return res.json(userData)
    } catch (err) {
      next(err)
    }
  }

  async acceptFriend(req, res, next) {
    const { friendID } = req.body
    const userId = req.user.id

    try {
      const userData = await userService.acceptFriend(friendID, userId)

      return res.json(userData)
    } catch (err) {
      next(err)
    }
  }

  async deleteFriend(req, res, next) {
    const { friendID } = req.body
    const userId = req.user.id

    try {
      const userData = await userService.deleteFriend(friendID, userId)

      return res.json(userData)
    } catch (err) {
      next(err)
    }
  }

  async cancelFriendRequest(req, res, next) {
    const { friendID } = req.body
    const userId = req.user.id

    try {
      const userData = await userService.cancelFriendRequest(friendID, userId)

      return res.json(userData)
    } catch (err) {
      next(err)
    }
  }

  async getFriends(req, res, next) {
    console.log('USER', req.user)
    const userId = req.params.userId === 'undefined' ? req.user.id : req.params.userId

    try {
      const friendsList = await userService.getFriends(userId)

      return res.json(friendsList)
    } catch (err) {
      next(err)
    }
  }
}

export default new UserContoller()
