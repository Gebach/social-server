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
    userData: {
      accessToken: tokens.accessToken,
      user: {
        userInfo: userDto,
        friendsRequests: user.friendsRequests,
        friendsToAccept: user.friendsToAccept,
        friends: user.friends,
      },
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
    const tokenFromDB = await tokenModel.findOne({ refreshToken })
    console.log(userData, '||||||||||||||||', tokenFromDB)
    if (!userData || !tokenFromDB) {
      throw ApiError.UnauthorizedError()
    }
    const user = await userModel.findById(userData.id)
    return tokenToDB(user)
  }

  async getUsers() {
    const users = await userModel.find()
    if (users.length == 0) {
      throw ApiError.BadRequest('Такого пользователя не существует')
    }
    return users.map(u => ({
      ...new UserDto(u),
      userProfilePicture: u.picture,
    }))
  }

  async getUser(userID) {
    const user = await userModel.findById(userID)
    if (!user) {
      throw ApiError.BadRequest('Такого пользователя не существует')
    }
    const userDto = new UserDto(user)
    return {
      user: {
        userInfo: userDto,
        friendsRequest: user.friendsRequests,
        friendsToAccept: user.friendsToAccept,
        friends: user.friends,
      },
      userProfilePicture: user.picture,
    }
  }

  async changeUserData(userData) {
    const user = await userModel.findByIdAndUpdate(userData.id, userData, { new: true })
    await user.save()
    return new UserDto(user)
  }

  async changeUserPassword(oldPassword, newPassword, id) {
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
    const userExists = await userModel.exists({ _id: id })
    if (!userExists) {
      throw ApiError.BadRequest('Такого пользователя не существует')
    }
    const user = await userModel.findByIdAndUpdate(id, { picture: path }, { new: true })

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

  async addFriend(friendID, userId) {
    const user = await userModel.findByIdAndUpdate(userId, { $addToSet: { friendsRequests: friendID } })
    const friend = await userModel.findByIdAndUpdate(friendID, { $addToSet: { friendsToAccept: userId } })
    if (!user || !friend) {
      throw ApiError.BadRequest('Такого пользователя не существует')
    }

    return {
      status: 'success',
      message: 'Your request has been sent',
    }
  }

  async acceptFriend(friendID, userId) {
    const user = await userModel.updateOne(
      { _id: userId },
      { $addToSet: { friends: friendID }, $pull: { friendsToAccept: friendID } },
    )
    const friend = await userModel.updateOne(
      { _id: friendID },
      { $addToSet: { friends: userId }, $pull: { friendsRequests: userId } },
    )
    if (!user || !friend) {
      throw ApiError.BadRequest('Такого пользователя не существует')
    }

    return {
      status: 'success',
      message: 'You are friends now!',
    }
  }

  async deleteFriend(friendID, userId) {
    const user = await userModel.updateOne(
      { _id: userId, friends: friendID },
      {
        $addToSet: { friendsToAccept: friendID },
        $pull: { friends: friendID },
      },
    )
    const friend = await userModel.updateOne(
      { _id: friendID, friends: userId },
      {
        $addToSet: { friendsRequests: userId },
        $pull: { friends: userId },
      },
    )
    if (!user || !friend) {
      throw ApiError.BadRequest('Такого пользователя не существует')
    }

    return {
      status: 'success',
      message: 'Your friend was removed to subscribers',
    }
  }

  async cancelFriendRequest(friendID, userId) {
    const user = await userModel.findByIdAndUpdate(userId, { $pull: { friendsRequests: friendID } })
    const friend = await userModel.findByIdAndUpdate(friendID, { $pull: { friendsToAccept: userId } })
    if (!user || !friend) {
      throw ApiError.BadRequest('Такого пользователя не существует')
    }

    return {
      status: 'success',
      message: "You've cutted all ties with your friend :(((",
    }
  }

  async getFriends(userId) {
    const user = await userModel
      .findById(userId)
      .populate('friends')
      .populate('friendsRequests')
      .populate('friendsToAccept')

    if (!user) {
      throw ApiError.BadRequest('Такого пользователя не существует')
    }

    return {
      friends: user.friends.map(f => {
        return { ...new UserDto(f), userProfilePicture: f.picture }
      }),
      friendsOut: user.friendsRequests.map(f => {
        return { ...new UserDto(f), userProfilePicture: f.picture }
      }),
      friendsIn: user.friendsToAccept.map(f => {
        return { ...new UserDto(f), userProfilePicture: f.picture }
      }),
    }
  }
}

export default new UserServices()
