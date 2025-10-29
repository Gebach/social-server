import 'dotenv/config'
import jwt from 'jsonwebtoken'
import tokenModel from '../models/tokenModel.js'

class TokenService {
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN, { expiresIn: '30m' })
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN, { expiresIn: '30d' })
    return {
      accessToken,
      refreshToken,
    }
  }

  async saveToken(userId, refreshToken) {
    try {
      const tokenData = await tokenModel.findOne({ user: userId })
      if (tokenData) {
        tokenData.refreshToken = refreshToken
        return tokenData.save()
      }
      const token = await tokenModel.create({ user: userId, refreshToken })
      return token
    } catch (e) {
      return null
    }
  }

  verifyAccessToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCESS_TOKEN)
      return userData
    } catch (err) {
      return null
    }
  }

  verifyRefreshToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_REFRESH_TOKEN)
      return userData
    } catch (err) {
      return null
    }
  }
}

export default new TokenService()
