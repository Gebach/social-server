import tokenModel from '../models/tokenModel.js'
import userService from '../services/userService.js'

class UserContoller {
  async registration(req, res, next) {
    try {
      const { email, login, password } = req.body
      const userData = await userService.registration(email, login, password)
      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })

      return res.json(userData)
    } catch (err) {
      next(err)
    }
  }

  async login(req, res, next) {
    try {
      const { login, password } = req.body
      const userData = await userService.login(login, password)
      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })

      return res.json(userData)
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

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body
      const tokenData = await userService.logout(refreshToken)
      return res.json(tokenData)
    } catch (err) {
      next(err)
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body
      const userData = await userService.refresh(refreshToken)
      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })

      return res.json(userData)
    } catch (err) {
      next(err)
    }
  }
}

export default new UserContoller()
