import UserDto from '../dtos/userDto.js'
import ApiError from '../exceptions/apiError.js'
import userModel from '../models/userModel.js'
import bcrypt from 'bcrypt'
import { v4 } from 'uuid'
import jwt from 'jsonwebtoken'
import tokenService from './tokenService.js'
import tokenModel from '../models/tokenModel.js'

async function tokenToDB(user) {
  const userDto = new UserDto(user)
  const tokens = tokenService.generateTokens({ ...userDto })
  await tokenService.saveToken(userDto.id, tokens.refreshToken)

  return {
    userData: {
      accessToken: tokens.accessToken,
      user: userDto,
      userProfilePicture: user.picture,
    },
    refreshToken: tokens.refreshToken,
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
    const checkPassword = await bcrypt.compare(password, user.password)
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
    console.log('REFRESH USERDATA', userData)
    const tokenFromDB = await tokenModel.findOne({ refreshToken })
    if (!userData || !tokenFromDB) {
      throw ApiError.UnauthorizedError()
    }
    const user = await userModel.findById(userData.id)
    return tokenToDB(user)
  }

  async getUsers() {
    const users = await userModel.find()
    return users
  }

  async getUser(userID) {
    const user = await userModel.findById(userID)
    const userDto = new UserDto(user)
    return {
      user: userDto,
      userProfilePicture: user.picture,
    }
  }

  async changeUserData(userData) {
    console.log('USERDATA', userData)
    const user = await userModel.findByIdAndUpdate(userData.id, userData, { new: true })
    await user.save()
    console.log('SERVICVE', user)
    return new UserDto(user)
  }

  async changeUserPassword(oldPassword, newPassword, id) {
    console.log('ID', id)
    console.log('OLDPASSWORD', oldPassword)
    const user = await userModel.findById(id)
    const checkPassword = await bcrypt.compare(oldPassword, user.password)
    if (!checkPassword) {
      throw ApiError.BadRequest('Неверный пароль')
    }

    const newUserPassword = await bcrypt.hash(newPassword, 3)
    user.password = newUserPassword
    await user.save()
    return {
      status: true,
      message: 'Пароль успешно изменен!',
    }
  }

  async uploadProfileImage(path, id) {
    console.log('PATH', path, id)
    const userExists = await userModel.exists({ _id: id })
    if (!userExists) {
      throw ApiError.BadRequest('Такого пользователя не существует')
    }
    const user = await userModel.findByIdAndUpdate(id, { picture: path }, { new: true })
    console.log('USER', user)

    return user.picture
  }

  async activateProfile(activationLink) {
    const user = await userModel.findOne({ activationLink })
    if (!user) {
      throw ApiError.BadRequest('Такого пользователя не существует')
    }
    user.isActivated = true
    return user.save()
  }
}

export default new UserServices()
