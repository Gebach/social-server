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
    try {
      const users = await userService.getUsers()
      return res.json(users)
    } catch (err) {
      next(err)
    }
  }

  async getUser(req, res, next) {
    const { userID } = req.body

    try {
      const userData = await userService.getUser(userID)
      console.log(userData)
      return res.json(userData)
    } catch (err) {
      next(err)
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies
      const tokenData = await userService.logout(refreshToken)
      console.log('TOKEN DATA AFTER LOGOUT', tokenData)
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
      console.log(user)

      return res.json(user)
    } catch (err) {
      next(err)
    }
  }

  async changeUserPassword(req, res, next) {
    try {
      const { oldPassword, newPassword, userID } = req.body
      const status = await userService.changeUserPassword(oldPassword, newPassword, userID)
      console.log(status)

      return res.json(status)
    } catch (err) {
      next(err)
    }
  }

  async uploadProfileImage(req, res, next) {
    console.log('FILE', req)
    console.log('FILE DATA', req.file)
    const { userId } = req.body
    try {
      const imagePath = await userService.uploadProfileImage(
        `${process.env.ORIGIN_FILES_URL}/${req.file.filename}`,
        userId
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
      console.log('ACTIVATE USERDATA', userData)

      return res.redirect(`${process.env.HOST_URL}/profile/${userData.id}`)
    } catch (err) {
      next(err)
    }
  }
}

export default new UserContoller()
