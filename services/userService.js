import UserDto from '../dtos/userDto.js'
import ApiError from '../exceptions/apiError.js'
import userModel from '../models/userModel.js'
import bcrypt from 'bcrypt'
import { v4 } from 'uuid'
import tokenService from './tokenService.js'
import tokenModel from '../models/tokenModel.js'

async function tokenToDB(user) {
  const userDto = new UserDto(user)
  const tokens = tokenService.generateTokens({ ...userDto })
  await tokenService.saveToken(userDto.id, tokens.refreshToken)

  return {
    ...tokens,
    user: userDto,
  }
}

class UserServices {
  async registration(email, login, pass) {
    const notUnique = (await userModel.findOne({ email })) || (await userModel.findOne({ login }))
    if (notUnique) {
      throw ApiError.BadRequest('Пользователь с такой почтой или логином уже существует')
    }

    const hashPassword = await bcrypt.hash(pass, 3)
    const activationLink = v4()
    const user = await userModel.create({ email, login, password: hashPassword, activationLink })

    return tokenToDB(user)
  }

  async login(login, password) {
    const user = await userModel.findOne({ login })
    if (!user) {
      throw ApiError.BadRequest('Пользователя с таким логином не существует')
    }
    console.log(password, user.password)
    const checkPassword = bcrypt.compare(password, user.password)
    if (!checkPassword) {
      throw ApiError.BadRequest('Неверный пароль')
    }
    return tokenToDB(user)
  }

  async logout(refreshToken) {
    const tokenData = await tokenModel.deleteOne({ refreshToken })

    return tokenData
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError()
    }
    const userData = tokenService.verifyRefreshToken(refreshToken)
    const tokenFormDB = tokenModel.findOne({ refreshToken })
    if (!userData || !tokenFormDB) {
      throw ApiError.UnauthorizedError()
    }
    const user = userModel.findById(userData.id)

    return tokenToDB(user)
  }

  async getUsers() {
    const users = await userModel.find()
    return users
  }
}

export default new UserServices()
